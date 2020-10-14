/**
 * @fileoverview Stanford Triangle Format Parser
 */

//Imports
import {categorizeFile, parseElements} from './utils';
import {deindex, index} from '../../utils/indice';
import {extractLocal, extractGlobal} from '../../utils/regex';
import {Mesh, ProgressEmitter} from '../../types';
import ntp from '../../interpreters/ntp';

//Patterns
const patterns = {
  body: /end_header[\r\n]{1,2}([\s\S]+)/,
  line: /(.+)/g,
  numericTuple: /([+-]?(?:\d*\.)?\d+(?:[eE][+-]?\d+)?)/g
};

/**
 * Parse a PLY file
 */
export const parse = (raw: ArrayBuffer, progress: ProgressEmitter): Mesh<'none', 'indexed'>[] =>
{
  //This mesh will have its info filled out (eventually)
  const mesh: Mesh<'none', 'indexed'> = {
    name: 'PLY',
    normals: undefined,
    vertices: {
      indices: [],
      vectors: []
    }
  };

  /**
   * Handle adding and interpreting vertice indices
   * @param verticeIndices 
   */
  const handleVerticeIndices = (verticeIndices: number[]) =>
  {
    if (verticeIndices.length == 3)
    {
      //Add
      mesh.vertices.indices.push(...verticeIndices);
    }
    //NTP interpreter
    else
    {
      //De-index the provided indices to get the actual vertices for NTP interpretation
      const polygonVertices = deindex({
        indices: verticeIndices,
        vectors: mesh.vertices.vectors
      });

      //Interpret with NTP (It will return local indices, which are different than global indices)
      const triangleIndices = ntp(polygonVertices);

      //De-index again (Gets the NTP vertices instead of indices)
      const triangleVertices = deindex({
        indices: triangleIndices,
        vectors: polygonVertices
      });

      //Combine all vertices together (So we can calculate global indices for the triangles)
      const globalVertices = [...mesh.vertices.vectors, ...triangleVertices];

      //Re-index (Calculate global indices)
      const {indices: globalIndices} = index(globalVertices);

      //Get the triangle indices (Global index)
      const globalTriangleIndices = globalIndices.slice(globalIndices.length - triangleIndices.length);

      //Interpret and add
      mesh.vertices.indices.push(...globalTriangleIndices);
    }
  };

  //Translate to string
  const file = new TextDecoder().decode(raw);

  //Get the file category
  const category = categorizeFile(file);

  //Parse elements
  const elements = parseElements(file);

  //Extract vertice information
  const verticeInfo = elements.find(element => element.name == 'vertex');
  const verticeCount = verticeInfo != null ? verticeInfo.count : 0;
  let verticeOffset = verticeInfo != null ? verticeInfo.offset : 0;

  //Extract face information
  const faceInfo = elements.find(element => element.name == 'face');
  const faceCount = faceInfo != null ? faceInfo.count : 0;
  let faceOffset = faceInfo != null ? faceInfo.offset : 0;

  //Extract body text
  const [body] = extractLocal(file, patterns.body, new Error('[PLY] Failed to extract file body!'));

  switch (category)
  {
    case 'ascii': {
      //Split lines and parse
      const lines = extractGlobal(body, patterns.line, new Error('[PLY] Failed to parse file body!'));

      //Get line count
      const lineCount = Object.keys(lines).length;

      //Calculate the progress report interval
      const progressInterval = lineCount < 100 ? 1 : Math.round(lineCount / 100);

      //Add vertices and indices
      for (const [i, [line]] of lines.entries())
      {
        //Add vertice
        if (verticeOffset <= i && i < (verticeOffset + verticeCount))
        {
          //Extract and parse vertices
          const vertices = extractGlobal(line, patterns.numericTuple, new Error('[PLY] Failed to parse vertice!'))
            .map(group => parseFloat(group[0]));

          //Add
          mesh.vertices.vectors.push(...vertices.slice(0, 3));
        }
        //Add vertice indices
        else if (faceOffset <= i && i < (faceOffset + faceCount))
        {
          //Extract and parse numeric data
          const verticeIndices = extractGlobal(line, patterns.numericTuple, new Error('[PLY] Failed to parse face!'))
            .map(group => parseInt(group[0]));

          //Double check vertice count
          if (verticeIndices[0] != verticeIndices.length - 1)
          {
            throw new Error('[PLY] Face list had incorrect vertice count!');
          }

          //Remove the vertice count
          verticeIndices.shift();

          //Deal with the vertices
          handleVerticeIndices(verticeIndices);
        }

        //Emit progress
        if (i % progressInterval == 0)
        {
          progress((i + 1) / lineCount);
        }
      }

      break;
    }

    case 'binary-be':
    case 'binary-le': {
      const littleEndian = (category == 'binary-le');

      //Slice raw to get body as an array buffer
      const bodyArrayBuffer = raw.slice(raw.byteLength - body.length);

      //Create a data view for aiding in manipulating binary data
      const dataView = raw instanceof ArrayBuffer ? new DataView(bodyArrayBuffer) : new DataView(new Uint8Array(bodyArrayBuffer).buffer);

      //Calculate binary offsets
      let offset = 0;
      for (const element of elements)
      {
        switch (element.name)
        {
          case 'vertex': {
            verticeOffset = offset;
            break;
          }

          case 'face': {
            faceOffset = offset;
            break;
          }
        }

        //Calculate current element size
        let elementSize = 0;
        for (const property of element.properties)
        {
          //List properties require us to read the binary file
          if (property.list)
          {
            for (let calculatedElements = 0; calculatedElements < element.count; calculatedElements++)
            {
              //Get the number of items (By using the `NumericTypes` API, we'll always use the correct `DataView` method)
              const count = property.countType.dataView.get.call(dataView, offset + elementSize, littleEndian);

              //Add the size of the counter and all items
              elementSize += property.countType.size + (count * property.type.size);
            }
          }
          //Non-list properties can have their length calculated
          else
          {
            elementSize += element.count * property.type.size;
          }
        }

        //Add the element size to the offset
        offset += elementSize;
      }

      //Calculate last vertice position
      const verticeMax = verticeOffset + (12 * verticeCount);

      //Calculate the vertice progress report interval
      const progressInterval = verticeCount < 100 ? 12 : (12 * Math.round(verticeCount / 100));

      //Iterate over vertices
      for (let i = verticeOffset; i < verticeMax; i += 12)
      {
        const x = dataView.getFloat32(i, littleEndian);
        const y = dataView.getFloat32(i + 4, littleEndian);
        const z = dataView.getFloat32(i + 8, littleEndian);

        mesh.vertices.vectors.push(x, y, z);

        //Emit progress
        if (i % (progressInterval) == 0)
        {
          progress(((i - verticeOffset) / (12 * verticeCount)) / 2);
        }
      }

      //Calculate the face progress report interval
      const faceProgressInterval = faceCount < 100 ? 1 : Math.round(faceCount / 100);

      //Iterate over faces (Dynamic iteration width controlled by number of vertices in each face)
      let offset2 = faceOffset;
      for (let i = 0; i < faceCount; i++)
      {
        //Get vertice count
        const count = dataView.getUint8(offset2);

        //Iterate over vertice indices (1 byte face count, 4 bytes per vertice indice)
        const verticeIndices = [];
        for (let j = (1 + offset2); j < (1 + offset2 + (4 * count)); j += 4)
        {
          verticeIndices.push(dataView.getInt32(j, littleEndian));
        }

        //Deal with the vertices
        handleVerticeIndices(verticeIndices);

        //Update offset (1 byte face count, 4 bytes per vertice indice)
        offset2 += 1 + (4 * count);

        //Emit progress
        if (i % faceProgressInterval == 0)
        {
          progress((((i + 1) / faceCount) / 2) + 0.5);
        }
      }

      break;
    }
  }

  //Emit final progress
  progress(1);

  return [mesh];
};