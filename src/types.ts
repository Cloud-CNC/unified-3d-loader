/**
 * @fileoverview Unified 3D Loader Types
 */

/**
 * A 3D file format
 */
export interface FileFormat
{
  /**
   * A human readable, UI/UX friendly name of the file
   */
  name: string,

  /**
   * The file formats's possible extensions
   */
  extensions: string[],

  /**
   * The file formats's possible MIME types
   */
  mimes: string[]
}

/**
 * File formats supported by the installed version of Unified 3D Loader
 * 
 * **Developers**: use this as the source of truth for your UI/UX so you won't
 * have to update very much when new file formats are added
 */
export const FileFormats: {
  _3MF: FileFormat,
  AMF: FileFormat,
  OBJ: FileFormat,
  PLY: FileFormat,
  STL: FileFormat
} = {
  _3MF: {
    name: '3D Manufacturing Format',
    extensions: [
      '3mf'
    ],
    mimes: [
      'model/3mf'
    ]
  },
  AMF: {
    name: 'Additive Manufacturing Format',
    extensions: [
      'amf'
    ],
    mimes: [
      'application/x-amf'
    ]
  },
  OBJ: {
    name: 'Wavefront OBJ Format',
    extensions: [
      'obj'
    ],
    mimes: [
      'text/plain'
    ]
  },
  PLY: {
    name: 'Stanford Triangle Format',
    extensions: [
      'ply'
    ],
    mimes: [
      'application/x-ply'
    ]
  },
  STL: {
    name: 'Stereolithography Format',
    extensions: [
      'stl'
    ],
    mimes: [
      'model/stl',
      'model/x.stl-ascii',
      'model/x.stl-binary'
    ]
  }
};

/**
 * The vector list type
 * * `none`: No vector list
 * * `non-indexed`: A non-indexed vector list (Raw vectors)
 * * `indexed`: An indexed vector list
 */
export type VectorListType = 'none' | 'non-indexed' | 'indexed';

/**
 * An indexed vector list is an array of unique vectors along with a list of
 * indices for those vectors. An IndexedVectorList can be used to represent
 * normals, vertices, and more.
 */
export interface IndexedVectorList
{
  /**
   * The indices referencing a vector
   */
  indices: number[],

  /**
   * The array of unique vectors
   */
  vectors: number[]
}

export interface Mesh<T extends VectorListType = 'indexed', U extends VectorListType = 'indexed'>
{
  /**
   * Name of the mesh
   */
  name: string,

  /**
   * The mesh normals
   */
  normals: T extends 'indexed' ? IndexedVectorList : T extends 'non-indexed' ? number[] : undefined,

  /**
   * The mesh vertices
   */
  vertices: U extends 'indexed' ? IndexedVectorList : U extends 'non-indexed' ? number[] : undefined,

  /**
   * Metadata extracted from the source mesh
   * 
   * **WARNING:** Treat the data contained withing this property as malicious unless explicity proved otherwise!
   */
  metadata?: any
}