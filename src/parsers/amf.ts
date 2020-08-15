/**
 * @fileoverview Additive Manufacturing Format Parser
 */

//Imports
import {extractMetadata} from '../utils/metadata';
import {Mesh} from '../types';
import {parse as parseXML} from 'fast-xml-parser';

//@ts-ignore See https://github.com/Stuk/jszip/issues/673#issuecomment-625211873 for more information
import JSZip from 'jszip/dist/jszip';

/**
 * Parse an AMF file
 * @param raw 
 */
export const parse = async (raw: ArrayBuffer): Promise<Mesh<'none', 'indexed'>[]> =>
{
  const files: string[] = [];
  const meshes: Mesh<'none', 'indexed'>[] = [];

  //Translate to string
  const rawString = new TextDecoder().decode(raw);

  //Detect ZIP compression
  if (rawString.substring(0, 2) == 'PK')
  {
    //Extract the files
    const archive = await JSZip.loadAsync(raw);

    for (const filename in archive.files)
    {
      //Test for `amf` file extension
      if (filename.toLowerCase().substring(filename.length - 3) == 'amf')
      {
        //Extract file and append
        files.push(await archive.files[filename].async('text'));
      }
    }
  }
  else
  {
    files.push(rawString);
  }

  //Iterate over files
  for (const file of files)
  {
    //Parse the file
    const parsed = parseXML(file, {
      ignoreAttributes: false
    }, true);

    if (parsed.amf == null)
    {
      throw new Error('[AMF] Expected root XML element!');
    }
    else if (parsed.amf.object == null)
    {
      throw new Error('[AMF] Expected root XML to have `object` child element!');
    }
    else
    {
      //Get scale
      let scale = 1;

      if (parsed.amf['@_unit'] != null)
      {
        switch (parsed.amf['@_unit'])
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

          case 'meter': {
            scale = 1000;

            break;
          }
        }
      }

      //Iterate over top-level elements
      for (const [key1, value1] of Object.entries(<object>parsed.amf))
      {
        if (key1 == 'object')
        {
          //Keep track of the current mesh
          const mesh: Mesh<'none', 'indexed'> = {
            name: 'AMF',
            normals: undefined,
            vertices: {
              indices: [],
              vectors: []
            },
            metadata: {}
          };

          //Iterate over secondary-level elements
          for (const [key2, value2] of Object.entries(<object>value1))
          {
            //Mesh
            if (key2 == 'mesh')
            {
              //Iterate over third level elements
              for (const [key3, value3] of Object.entries(<object>value2))
              {
                //Vertices
                if (key3 == 'vertices')
                {
                  //Iterate over fourth level elements
                  for (const [key4, value4] of Object.entries(<object>value3))
                  {
                    //Vertex
                    if (key4 == 'vertex')
                    {
                      for (const vertex of value4)
                      {
                        if (vertex.coordinates != null)
                        {
                          //Scale
                          const x = scale * vertex.coordinates.x;
                          const y = scale * vertex.coordinates.y;
                          const z = scale * vertex.coordinates.z;

                          //Add the component
                          mesh.vertices.vectors.push(x, y, z);
                        }
                      }
                    }
                  }
                }
                //Indices
                else if (key3 == 'volume')
                {
                  //Iterate over fourth level elements
                  for (const [key4, value4] of Object.entries(<object>value3))
                  {
                    if (key4 == 'triangle')
                    {
                      //Component
                      for (const component of value4)
                      {
                        //Scale
                        const v1 = component.v1;
                        const v2 = component.v2;
                        const v3 = component.v3;

                        //Add the component
                        mesh.vertices.indices.push(v1, v2, v3);
                      }
                    }
                  }
                }
              }
            }
          }


          //Get metadata
          mesh.metadata = extractMetadata(value1);

          //Add the mesh
          meshes.push(mesh);
        }
      }
    }
  }

  return meshes;
};