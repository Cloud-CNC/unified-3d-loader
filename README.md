# Unified 3D Loader
![status](https://img.shields.io/badge/status-release-brightgreen)
[![npm](https://img.shields.io/npm/v/unified-3d-loader)](https://npmjs.com/package/unified-3d-loader)
[![tests](https://img.shields.io/github/workflow/status/Cloud-CNC/unified-3d-loader/Tests?label=tests)](https://github.com/Cloud-CNC/unified-3d-loader/actions)
[![issues](https://img.shields.io/github/issues/Cloud-CNC/unified-3d-loader)](https://github.com/Cloud-CNC/unified-3d-loader/issues)
[![last commit](https://img.shields.io/github/last-commit/Cloud-CNC/unified-3d-loader)](https://github.com/Cloud-CNC/unified-3d-loader/commits/master)

A 3D file loader designed to produce consistent mesh data regardless of file format. Intended for use as a front-end for triangle-based 3D processing.

## Features
* Get indexed or non-indexed (raw) vertices and normals regardless of input format
* Support for many files associated with CNC machine workflows
* Written in modern TypeScript
* Thoroughly commented

## Documentation
### File Formats
Name | Extension | Status | ThreeJS Loader | Cura Reader | Specification | Specification Compliance | Comment
--- | --- | --- | --- | --- | --- | --- | ---
3D Manufacturing Format | `.3mf` | ✔️ | [3MFLoader](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/3MFLoader.js) | [3MFReader](https://github.com/Ultimaker/Cura/tree/master/plugins/3MFReader) | [3MF.io](https://3mf.io/specification/) | ~70% | Does not support print tickets or many other [OPC](https://en.wikipedia.org/wiki/Open_Packaging_Conventions) features. Always recalculates normals.
Additive Manufacturing Format | `.amf` | ✔️ | [AMFLoader](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/AMFLoader.js) | [AMFReader](https://github.com/Ultimaker/Cura/blob/master/plugins/AMFReader/AMFReader.py) | [ISO/ASTM 52915:2020](https://www.iso.org/standard/74640.html) | ~99% | Does not specifically extract model name metadata (This can be extracted from the metadata mesh property). Always recalculates normals.
Stanford Triangle Format | `.ply` | ✔️ | [PLYLoader](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/PLYLoader.js) | [TrimeshReader](https://github.com/Ultimaker/Cura/blob/master/plugins/TrimeshReader/TrimeshReader.py) | [Gamma Research Group (University of North Carolina)](https://gamma.cs.unc.edu/POWERPLANT/papers/ply.pdf) | ~100% | Supports non-triangular, planar polygons. Always recalculates normals.
Wavefront OBJ Format | `.obj` | ✔️ | [OBJLoader2](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/OBJLoader2.js) | N/A | [Wikipedia](http://paulbourke.net/dataformats/obj/) | ~30% | Supports non-triangular, planar polygons. Does not support complex geometries (Basis Matrixes, Beizer/NURBS/Cardinal/Taylor surfaces and/or curves). Always recalculates normals.
Stereolithography Format | `.stl` | ✔️ | [STLLoader](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/STLLoader.js) | N/A | [Wikipedia](https://en.wikipedia.org/wiki/STL_(file_format)#ASCII_STLs) | 100% | Never recalculates normals (Always uses user-supplied instead).

### Example
```Javascript
//Imports
import {FileFormats, Unified3dLoader} from 'unified-3d-loader';

const main = async () =>
{
  //Instantiate a new loader
  const loader = new Unified3dLoader();

  //Load a file (in indexed mode)
  const indexedObjects = await loader.load(/* <ArrayBuffer> */, FileFormats.STL);

  console.log(indexedObjects);
  /**
   * name: 'Cube',
   * normals: {
   *  indices: number[]
   *  vectors: number[]
   * },
   * vertices: {
   *  indices: number[]
   *  vectors: number[]
   * }
   */

  //Load a file (in non-indexed mode)
  const nonIndexedObjects = await loader.load(/* <ArrayBuffer> */, FileFormats.STL, false);

  console.log(nonIndexedObjects);
  /**
   * name: 'Cube',
   * normals: number[],
   * vertices: number[]
   */
};

main();
```