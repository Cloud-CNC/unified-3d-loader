/**
 * @fileoverview Wavefront OBJ Parser
 */

//Imports
import {deindex, index} from '../utils/indice';
import {extractLocal, extractGlobal} from '../utils/regex';
import {Mesh, ProgressEmitter} from '../types';
import ntp from '../interpreters/ntp';

/**
 * Types of OBJ files
 * 
 * * `group-only`: Treats groups as distinct meshes, ignore objects
 * * `object-only`: Treats objects as distinct meshes, ignores groups
 * * `hybrid`: Treats both groups and objects as distinct meshes
 */
export type ObjFormats = 'group-only' | 'object-only' | 'hybrid';

/**
 * Parse an OBJ file
 * @param raw 
 */
export const parse = (raw: ArrayBuffer, format: ObjFormats, progress: ProgressEmitter): Mesh<'none', 'indexed'>[] =>
{
  //Translate to string
  const file = new TextDecoder().decode(raw);

  const meshes: Mesh<'none', 'indexed'>[] = [];

  //Patterns
  const patterns = {
    entity: /^[og] (\w+)/,
    face: /(\d+)\/\d*\/\d*/g,
    float: /([+-]?(?:\d*\.)?\d+(?:[eE][+-]?\d+)?)/,
    line: /^((f|g|o|v) [^\r\n]+)/gm,
    vertices: /temporary/
  };

  patterns.vertices = new RegExp(`^v${`\\s+${patterns.float.source}`.repeat(3)}`);

  //Keep track of the current mesh
  const mesh: Mesh<'none', 'indexed'> = {
    name: '',
    normals: undefined,
    vertices: {
      indices: [],
      vectors: []
    }
  };

  //Parse lines
  const lines = extractGlobal(file, patterns.line, new Error('[OBJ] Failed to parse lines!'));

  //Calculate the progress report interval
  const progressInterval = lines.length < 100 ? 1 : Math.round(lines.length / 100);

  for (const [lineIndex, [line, type]] of lines.entries())
  {
    switch (type)
    {
      //Parse entity (Object or group)
      case 'g':
      case 'o': {
        //Ignore groups and/or/nor objects
        if ((format == 'group-only' && type == 'g') ||
          (format == 'object-only' && type == 'o') ||
          format == 'hybrid')
        {
          //Add existing mesh to mesh list
          meshes.push(mesh);

          //Parse object
          const object = extractLocal(line, patterns.entity, new Error('[OBJ] Failed to parse object!'));

          //Reset mesh
          mesh.name = object[0];
          mesh.vertices = {
            indices: [],
            vectors: []
          };
        }

        break;
      }

      case 'v': {
        //Parse vertices
        const vertice = extractLocal(line, patterns.vertices, new Error('[OBJ] Failed to parse vertice!'));

        //Convert to numbers
        const x = parseFloat(vertice[0]);
        const y = parseFloat(vertice[1]);
        const z = parseFloat(vertice[2]);

        //Add vertice
        mesh.vertices.vectors.push(x, y, z);

        break;
      }

      case 'f': {
        //Parse the face
        const verticeIndices = extractGlobal(line, patterns.face, new Error('[OBJ] Failed to parse face!'))
          .map(vertice => parseInt(vertice[0]) - 1);

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

        break;
      }
    }

    //Emit progress
    if (lineIndex % progressInterval == 0)
    {
      progress((lineIndex + 1) / lines.length);
    }
  }

  //Emit final progress
  progress(1);

  return meshes;
};