/**
 * @fileoverview 3D Manufacturing Format
 */

//Imports
import {extractGlobal} from '../utils/regex';
import {extractMetadata} from '../utils/metadata';
import {Mesh, ProgressEmitter} from '../types';
import {multiply} from 'mathjs';
import {parse as parseXML} from 'fast-xml-parser';
import {round} from 'lodash';

//@ts-ignore See https://github.com/Stuk/jszip/issues/673#issuecomment-625211873 for more information
import JSZip from 'jszip/dist/jszip';

/**
 * Parse a 3MF file
 * @param raw 
 */
export const parse = async (raw: ArrayBuffer, progress: ProgressEmitter): Promise<Mesh<'none', 'indexed'>[]> =>
{
  const files: string[] = [];
  const meshes: Mesh<'none', 'indexed'>[] = [];

  //Translate to string
  const rawString = new TextDecoder().decode(raw);

  //Detect ZIP compression
  if (rawString.substring(0, 2) != 'PK')
  {
    throw new Error('[3MF] Invalid magic bytes! (Expected "PK")');
  }
  else
  {
    //Extract the files
    const archive = await JSZip.loadAsync(raw);

    for (const filename in archive.files)
    {
      //Test for `model` file extension
      if (filename.toLowerCase().substring(filename.length - 5) == 'model')
      {
        //Extract file and append
        files.push(await archive.files[filename].async('text'));
      }
    }
  }

  //Iterate over files
  for (const file of files)
  {
    //Parse the file
    const parsed = parseXML(file, {
      ignoreAttributes: false
    }, true);

    if (parsed.model == null)
    {
      throw new Error('[3MF] Expected root XML element!');
    }
    else if (parsed.model.build == null || parsed.model.resources == null)
    {
      throw new Error('[3MF] Expected root XML to have `build` and `resources` child elements!');
    }
    else
    {
      //Get model scale
      let scale = 1;

      if (parsed.model['@_unit'] != null)
      {
        switch (parsed.model['@_unit'])
        {
          case 'inch': {
            scale = 25.4;

            break;
          }

          case 'feet': {
            scale = 304.8;

            break;
          }

          case 'micron': {
            scale = 0.001;

            break;
          }

          default:
          case 'millimeter': {
            scale = 1;

            break;
          }

          case 'centimeter': {
            scale = 10;

            break;
          }

          case 'meter': {
            scale = 1000;

            break;
          }
        }
      }

      //Use the identity matrix (No transformations)
      let transformationMatrix;

      //Iterate over top-level elements
      for (const [key1, value1] of Object.entries(parsed.model))
      {
        if (key1 == 'build')
        {
          //Iterate over secondary-level elements
          for (const [key2, value2] of Object.entries(<object>value1))
          {
            //Transform
            if (key2 == 'item' &&
              value2['@_transform'] != null)
            {
              //Parse transform matrix
              const matrixStrings = extractGlobal(value2['@_transform'], /([+-]?(?:\d*\.)?\d+(?:[eE][+-]?\d+)?)/g, new Error('[3MF] Failed to parse transformation matrix!'));

              if (matrixStrings.length != 12)
              {
                throw new Error(`[3MF] Transformation matrix had ${matrixStrings.length} items! (Expected 12)`);
              }
              else
              {
                //Convert strings to numbers
                const matrixNumbers = matrixStrings.map(item => parseFloat(item[0]));

                //Convert to column-major order
                transformationMatrix = [
                  [matrixNumbers[0], matrixNumbers[1], matrixNumbers[2], 0],
                  [matrixNumbers[3], matrixNumbers[4], matrixNumbers[5], 0],
                  [matrixNumbers[6], matrixNumbers[7], matrixNumbers[8], 0],
                  [matrixNumbers[9], matrixNumbers[10], matrixNumbers[11], 1]
                ];
              }
            }
          }
        }
      }

      //Iterate over top-level elements
      for (const [key1, value1] of Object.entries(parsed.model))
      {
        if (key1 == 'resources')
        {
          //Iterate over secondary-level elements
          for (const [key2, value2] of Object.entries(<object>value1))
          {
            //Mesh
            if (key2 == 'object')
            {
              //Keep track of the current mesh
              const mesh: Mesh<'none', 'indexed'> = {
                name: '3MF',
                normals: undefined,
                vertices: {
                  indices: [],
                  vectors: []
                }
              };

              //Iterate over secondary-level elements
              for (const [key3, value3] of Object.entries(<object>value2))
              {
                //Mesh
                if (key3 == 'mesh')
                {
                  //Iterate over fourth level elements
                  for (const [key4, value4] of Object.entries(<object>value3))
                  {
                    //Vertices
                    if (key4 == 'vertices')
                    {
                      //Iterate over fifth level elements
                      for (const [key5, value5] of Object.entries(<object>value4))
                      {
                        //Vertex
                        if (key5 == 'vertex')
                        {
                          //Calculate the progress report interval
                          const progressInterval = Math.round(value5.length / 100);

                          for (const [vertexIndex, vertex] of value5.entries())
                          {
                            //Parse the text
                            const x = scale * parseFloat(vertex['@_x']);
                            const y = scale * parseFloat(vertex['@_y']);
                            const z = scale * parseFloat(vertex['@_z']);

                            //Only use the transformation matrix if its defined
                            if (transformationMatrix != null)
                            {
                              //@ts-ignore The multiply method can return a 1D array if one of the inputs is 1 wide
                              let vector: number[] = multiply(transformationMatrix, [x, y, z, 1]);

                              //Remove the last vector to convert from R4 (4D) to R3 (3D)
                              vector.pop();

                              //round to remove imprecision
                              vector = vector.map(component => round(component, 10));

                              //Add the component
                              mesh.vertices.vectors.push(...vector);
                            }
                            else
                            {
                              //Add the component
                              mesh.vertices.vectors.push(x, y, z);
                            }

                            //Emit progress
                            if (vertexIndex % progressInterval == 0)
                            {
                              progress((vertexIndex / value5.length) / 2);
                            }
                          }
                        }
                      }
                    }
                    //Indices
                    else if (key4 == 'triangles')
                    {
                      //Iterate over fifth level elements
                      for (const [key5, value5] of Object.entries(<object>value4))
                      {
                        //Triangle
                        if (key5 == 'triangle')
                        {
                          //Calculate the progress report interval
                          const progressInterval = Math.round(value5.length / 100);

                          for (const [triangleIndex, triangle] of value5.entries())
                          {
                            //Parse the text
                            const v1 = parseInt(triangle['@_v1']);
                            const v2 = parseInt(triangle['@_v2']);
                            const v3 = parseInt(triangle['@_v3']);

                            //Add the component
                            mesh.vertices.indices.push(v1, v2, v3);

                            //Emit progress
                            if (triangleIndex % progressInterval == 0)
                            {
                              progress(((triangleIndex / value5.length) / 2) + 0.5);
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }

              //Get metadata
              mesh.metadata = extractMetadata(value2);

              //Add the mesh
              meshes.push(mesh);
            }
          }
        }
      }
    }
  }

  return meshes;
};