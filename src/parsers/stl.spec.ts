/**
 * @fileoverview STL Parser Unit Tests
 */

//Imports
import {categorizeFile, parse} from './stl';
import {createHash} from 'crypto';
import {expect} from 'chai';
import {readFileSync} from 'fs';
import {resolve} from 'path';

/**
 * Cube STL
 */
const cube = {
  ascii: readFileSync(resolve('assets/stl/cube-ascii.stl')),
  binary: readFileSync(resolve('assets/stl/cube-binary.stl')),
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

describe('stl parser', () =>
{
  it('will categorize files', () =>
  {
    const category1 = categorizeFile(cube.ascii);
    expect(category1).to.equal('ascii');

    const category2 = categorizeFile(cube.binary);
    expect(category2).to.equal('binary');
  });

  it('will parse an ascii file', () =>
  {
    let previous = -1;
    const file = parse(cube.ascii, progress =>
    {
      expect(progress).to.be.gte(previous);
      previous = progress;
    });

    expect(previous).to.equal(1);

    expect(file).to.have.length(1);

    expect(file[0].name).to.equal('CUBE');

    expect(file[0].normals).to.eql(cube.normals);
    expect(file[0].vertices).to.eql(cube.vertices);
  });

  it('will parse a binary file', () =>
  {
    let previous = -1;
    const file = parse(cube.binary, progress =>
    {
      expect(progress).to.be.gte(previous);
      previous = progress;
    });

    expect(previous).to.equal(1);

    expect(file).to.have.length(1);

    expect(file[0].name).to.equal('Binary STL');

    expect(file[0].normals).to.eql(cube.normals);
    expect(file[0].vertices).to.eql(cube.vertices);
  });

  it('will parse benchy', () =>
  {
    const benchy = readFileSync(resolve('assets/stl/benchy.stl'));

    let previous = -1;
    const files = parse(benchy, progress =>
    {
      expect(progress).to.be.gte(previous);
      previous = progress;
    });

    expect(previous).to.equal(1);

    expect(files).to.have.length(1);

    expect(files[0].name).to.equal('Binary STL');

    const normals = createHash('sha256').update(new Float32Array(files[0].normals)).digest('hex');
    const vertices = createHash('sha256').update(new Float32Array(files[0].vertices)).digest('hex');

    expect(normals).to.equal('0f3a3dfb623fa9569207dfa34dbbd6169002c043a7fa73583232535388839691');
    expect(vertices).to.equal('34433c4ac106b94398722aa1eea22343f3f6ca8f95e2cf7363daba6010af5bc4');
  });
});