/**
 * @fileoverview Main Entry File Unit Tests
 */

//Imports
import {expect} from 'chai';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import {Unified3dLoader} from './index';
import {FileFormats} from './types';

/**
 * Cube OBJ
 */
const rawCube = readFileSync(resolve('assets/obj/cube-group.obj'));

describe('main entry file', () =>
{
  const indexedCube = {
    normals: {
      indices: [
        0, 0,
        1, 1,
        2, 2,
        3, 3,
        4, 4,
        5, 5
      ],
      vectors: [
        0, 0, -1,
        -1, 0, 0,
        0, 1, 0,
        1, 0, 0,
        0, -1, 0,
        0, 0, 1
      ]
    },
    vertices: {
      indices: [
        0, 1, 2,
        0, 3, 1,
        0, 4, 3,
        0, 5, 4,
        3, 6, 1,
        3, 4, 6,
        2, 1, 6,
        2, 6, 7,
        0, 2, 7,
        0, 7, 5,
        5, 7, 6,
        5, 6, 4,
      ],
      vectors: [
        0, 0, 0,
        1, 1, 0,
        1, 0, 0,
        0, 1, 0,
        0, 1, 1,
        0, 0, 1,
        1, 1, 1,
        1, 0, 1
      ]
    }
  };

  it('will load files and output indexed meshes', async () =>
  {
    const loader = new Unified3dLoader();

    const objects = await loader.load(rawCube, FileFormats.OBJ, {
      index: {
        normals: true,
        vertices: true
      }
    });

    expect(objects).to.have.length(1);

    expect(objects[0].name).to.equal('CUBE');

    expect(objects[0].normals).to.eql(indexedCube.normals);
    expect(objects[0].vertices).to.eql(indexedCube.vertices);
  });

  const nonIndexedCube = {
    normals: [
      0, 0, -1,
      0, 0, -1,
      -1, 0, 0,
      -1, 0, 0,
      0, 1, 0,
      0, 1, 0,
      1, 0, 0,
      1, 0, 0,
      0, -1, 0,
      0, -1, 0,
      0, 0, 1,
      0, 0, 1
    ],
    vertices: [
      0, 0, 0,
      1, 1, 0,
      1, 0, 0,
      0, 0, 0,
      0, 1, 0,
      1, 1, 0,
      0, 0, 0,
      0, 1, 1,
      0, 1, 0,
      0, 0, 0,
      0, 0, 1,
      0, 1, 1,
      0, 1, 0,
      1, 1, 1,
      1, 1, 0,
      0, 1, 0,
      0, 1, 1,
      1, 1, 1,
      1, 0, 0,
      1, 1, 0,
      1, 1, 1,
      1, 0, 0,
      1, 1, 1,
      1, 0, 1,
      0, 0, 0,
      1, 0, 0,
      1, 0, 1,
      0, 0, 0,
      1, 0, 1,
      0, 0, 1,
      0, 0, 1,
      1, 0, 1,
      1, 1, 1,
      0, 0, 1,
      1, 1, 1,
      0, 1, 1
    ]
  };

  it('will load files and output non-indexed meshes', async () =>
  {
    const loader = new Unified3dLoader();

    const objects = await loader.load(rawCube, FileFormats.OBJ, {
      index: {
        normals: false,
        vertices: false
      }
    });

    expect(objects).to.have.length(1);

    expect(objects[0].name).to.equal('CUBE');

    expect(objects[0].normals).to.eql(nonIndexedCube.normals);
    expect(objects[0].vertices).to.eql(nonIndexedCube.vertices);
  });
});