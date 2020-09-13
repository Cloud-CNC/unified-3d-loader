/**
 * @fileoverview Stereolithography Format Parser
 * Based off of https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/STLLoader.js
 */

//Imports
import {contains} from '../utils/array';
import {extractLocal, extractGlobal} from '../utils/regex';
import {Mesh, ProgressEmitter} from '../types';

/**
 * Types of STL files
 * 
 * * `ascii`: Plain text STL format
 * * `binary`: Binary STL format
 */
export type StlFormats = 'ascii' | 'binary';

/**
 * Categorize a file
 * @param data The file to categorize
 */
export const categorizeFile = (buffer: ArrayBuffer): StlFormats =>
{
  const data = buffer instanceof ArrayBuffer ? new DataView(buffer) : new DataView(new Uint8Array(buffer).buffer);

  //Get number of faces
  const faces = data.getUint32(80, true);

  //If the file has the correct length for a binary file, it's a binary file
  if ((84 + (50 * faces)) == data.byteLength)
  {
    return 'binary';
  }

  //ASCII magic bytes
  const magicBytes = 'solid'.split('').map(char => char.charCodeAt(0));

  //Test for magic bytes anywhere within the first 5 bytes to accommodate BOM markers
  const potentialMagicBytes = Array.from(new Uint8Array(data.buffer.slice(0, magicBytes.length + 5)));

  if (contains(potentialMagicBytes, magicBytes))
  {
    return 'ascii';
  }

  throw new Error('[STL] Failed to detect file type!');
};

/**
 * Parse an STL file
 * @param raw 
 */
export const parse = (raw: ArrayBuffer, progress: ProgressEmitter): Mesh<'non-indexed', 'non-indexed'>[] =>
{
  //Categorize the file
  const category = categorizeFile(raw);

  switch (category)
  {
    case 'ascii': {
      //Translate to string
      const file = new TextDecoder().decode(raw);

      const meshes: Mesh<'non-indexed', 'non-indexed'>[] = [];

      //Patterns
      const patterns = {
        facet: /facet([\s\S]*?)endfacet/g,
        float: /([+-]?(?:\d*\.)?\d+(?:[eE][+-]?\d+)?)/,
        loop: /outer loop([\s\S]*?)endloop/g,
        normal: /temporary/g,
        number: /([+-]?\d*(\.\d)?)/,
        solid: /solid (\S+)\s([\s\S]*?)\sendsolid/g,
        vertice: /temporary/g
      };

      patterns.normal = new RegExp(`normal${`\\s+${patterns.float.source}`.repeat(3)}`);
      patterns.vertice = new RegExp(`vertex${`\\s+${patterns.float.source}`.repeat(3)}`, 'g');

      //Parse solids
      const solids = extractGlobal(file, patterns.solid, new Error('[STL] Failed to parse solids!'));

      for (const [solidName, solid] of solids)
      {
        const mesh: Mesh<'non-indexed', 'non-indexed'> = {
          name: solidName,
          vertices: [],
          normals: []
        };

        //Parse facets
        const facets = extractGlobal(solid, patterns.facet, new Error('[STL] Failed to parse facets!'));

        for (const [facetIndex, [facet]] of facets.entries())
        {
          //Parse normal
          const normal = extractLocal(facet, patterns.normal, new Error('[STL] Failed to parse normal!'));

          //Convert to numbers
          const a = parseFloat(normal[0]);
          const b = parseFloat(normal[1]);
          const c = parseFloat(normal[2]);

          //Add to mesh
          mesh.normals.push(a, b, c);

          //Parse loops
          const loops = extractGlobal(facet, patterns.loop, new Error('[STL] Failed to parse loops!'));

          for (const [loop] of loops)
          {
            //Parse vertices
            const vertices = extractGlobal(loop, patterns.vertice, new Error('[STL] Failed to parse vertices!'));

            for (const vertice of vertices)
            {
              //Convert to numbers
              const x = parseFloat(vertice[0]);
              const y = parseFloat(vertice[1]);
              const z = parseFloat(vertice[2]);

              //Add to mesh
              mesh.vertices.push(x, y, z);
            }
          }

          //Emit progress
          progress(facetIndex / facets.length);
        }

        //Add mesh to meshes
        meshes.push(mesh);
      }

      return meshes;
    }

    case 'binary': {
      const mesh: Mesh<'non-indexed', 'non-indexed'> = {
        name: 'Binary STL',
        vertices: [],
        normals: []
      };

      const faces = (raw.byteLength - 84) / 50;

      //Create a data view for aiding in manipulating binary data
      const dataView = raw instanceof ArrayBuffer ? new DataView(raw) : new DataView(new Uint8Array(raw).buffer);

      //Iterate over each face
      for (let face = 0; face < faces; face++)
      {
        //Get current offset
        const offset = 84 + (50 * face);

        //First vector float is the normal
        mesh.normals.push(dataView.getFloat32(offset, true), dataView.getFloat32(offset + 4, true), dataView.getFloat32(offset + 8, true));

        //Second vector float is vertice 1
        mesh.vertices.push(dataView.getFloat32(offset + 12, true), dataView.getFloat32(offset + 16, true), dataView.getFloat32(offset + 20, true));

        //Third vector float is vertice 2
        mesh.vertices.push(dataView.getFloat32(offset + 24, true), dataView.getFloat32(offset + 28, true), dataView.getFloat32(offset + 32, true));

        //Fourth vector float is vertice 3
        mesh.vertices.push(dataView.getFloat32(offset + 36, true), dataView.getFloat32(offset + 40, true), dataView.getFloat32(offset + 44, true));

        //NOTE: Remaining 2 bytes are proprietary and not standardized

        //Emit progress
        progress(face / faces);
      }

      return [mesh];
    }
  }
};