/**
 * @fileoverview Normal Utilities Unit Tests
 */

//Imports
import {calculateFaceNormals} from './normal';
import {expect} from 'chai';

describe('normal utilities', () =>
{
  it('will calculate face normals', () =>
  {
    const vertices = [
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
    ];

    const normals = calculateFaceNormals(vertices);

    expect(normals).to.eql([
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
    ]);
  });
});