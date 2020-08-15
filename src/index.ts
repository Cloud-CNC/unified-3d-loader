/**
 * @fileoverview Unified 3D Loader
 */

//Imports
import {deindex, index} from './utils/indice';
import {FileFormat, FileFormats, Mesh, VectorListType} from './types';
import {parse as parse3MF} from './parsers/3mf';
import {parse as parseAMF} from './parsers/amf';
import {parse as parseOBJ, ObjFormats} from './parsers/obj';
import {parse as parsePLY} from './parsers/ply';
import {parse as parseSTL} from './parsers/stl';
import {calculateFaceNormals} from './utils/normal';

//Re-exports
export {FileFormats} from './types';

/**
 * User-supplied loader instantiation config
 */
interface config
{
  /**
   * The OBJ parsing mode
   */
  objMode: ObjFormats
}

/**
 * Mesh output config
 */
interface MeshOutput
{
  /**
   * Wether or not the files are/should be indexed
   */
  index: {
    /**
     * Normals index setting
     */
    normals: boolean,

    /**
     * Vertices index setting
     */
    vertices: boolean
  }
}

//Export
export class Unified3dLoader
{
  /**
   * The user-supplied loader config
   */
  private config: config;

  constructor(config?: Partial<config>)
  {
    this.config = {
      objMode: 'group-only',
      ...config
    };
  }

  /**
   * Load the supplied file
   * @param file The file to load
   * @param type The file's type (Use `unified-3d-loader.FileFormats` for an up-to-date of all supported file types)
   * @param output The output mesh settings
   */
  async load(file: ArrayBuffer, type: FileFormat, output: MeshOutput): Promise<Mesh<VectorListType, VectorListType>[]>
  {
    /**
     * Process the supplied meshes and convert to the desired format
     * @param meshes The meshes to convert
     */
    const processMeshes = (meshes: Mesh<VectorListType, VectorListType>[]): Mesh<VectorListType, VectorListType>[] =>
    {
      //Process all meshes
      for (const mesh of meshes)
      {
        //De-index normals
        if (mesh.normals != null &&
          !(mesh.normals instanceof Array))
        {
          mesh.normals = deindex(mesh.normals);
        }

        //De-index vertices
        if (mesh.vertices != null &&
          !(mesh.vertices instanceof Array))
        {
          mesh.vertices = deindex(mesh.vertices);
        }

        //Calculate normals
        if (mesh.normals == null &&
          mesh.vertices != null)
        {
          mesh.normals = calculateFaceNormals(mesh.vertices);
        }

        //Index normals
        if (mesh.normals != null &&
          output.index.normals)
        {
          const {indices, vectors} = index(mesh.normals);

          mesh.normals = {
            indices,
            vectors
          };
        }

        //Index vertices
        if (mesh.vertices != null &&
          output.index.vertices)
        {
          const {indices, vectors} = index(mesh.vertices);

          mesh.vertices = {
            indices,
            vectors
          };
        }
      }

      return meshes;
    };

    switch (type)
    {
      //Parse 3MF
      case FileFormats._3MF: {
        let meshes = await parse3MF(file);
        meshes = processMeshes(meshes);

        return <any>meshes;
      }

      //Parse AMF
      case FileFormats.AMF: {
        let meshes = await parseAMF(file);
        meshes = processMeshes(meshes);

        return <any>meshes;
      }

      //Parse OBJ
      case FileFormats.OBJ: {
        let meshes = parseOBJ(file, this.config.objMode);
        meshes = processMeshes(meshes);

        return <any>meshes;
      }

      //Parse PLY
      case FileFormats.PLY: {
        let meshes = parsePLY(file);
        meshes = processMeshes(meshes);

        return <any>meshes;
      }

      //Parse STL
      case FileFormats.STL: {
        let meshes = parseSTL(file);
        meshes = processMeshes(meshes);

        return <any>meshes;
      }

      default: {
        throw new Error('Invalid file format!');
      }
    }
  }
}