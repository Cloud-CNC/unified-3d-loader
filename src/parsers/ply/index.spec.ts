/**
 * @fileoverview Stanford Triangle Format Parser Unit Tests
 */

//Imports
import {createHash} from 'crypto';
import {expect} from 'chai';
import {parse} from '.';
import {readFileSync} from 'fs';
import {resolve} from 'path';

/**
 * Cube PLY
 */
const cube = {
  ascii: readFileSync(resolve('assets/ply/cube-ascii.ply')),
  binaryBE: readFileSync(resolve('assets/ply/cube-binary-be.ply')),
  binaryLE: readFileSync(resolve('assets/ply/cube-binary-le.ply')),
  ntp: readFileSync(resolve('assets/ply/cube-ntp.ply')),
  vertices: {
    indices: [
      0, 6, 4,
      0, 2, 6,
      0, 3, 2,
      0, 1, 3,
      2, 7, 6,
      2, 3, 7,
      4, 6, 7,
      4, 7, 5,
      0, 4, 5,
      0, 5, 1,
      1, 5, 7,
      1, 7, 3
    ],
    vectors: [
      0, 0, 0,
      0, 0, 1,
      0, 1, 0,
      0, 1, 1,
      1, 0, 0,
      1, 0, 1,
      1, 1, 0,
      1, 1, 1
    ]
  }
};

describe('ply parser', () =>
{
  it('will parse an ascii file', () =>
  {
    let previous = -1;
    const files = parse(cube.ascii, progress =>
    {
      expect(progress).to.be.gte(previous);
      previous = progress;
    });

    expect(previous).to.equal(1);

    expect(files).to.have.length(1);

    expect(files[0].name).to.equal('PLY');
    expect(files[0].vertices).to.eql(cube.vertices);
  });

  it('will parse a binary file (big endian encoding)', () =>
  {
    let previous = -1;
    const files = parse(cube.binaryBE, progress =>
    {
      expect(progress).to.be.gte(previous);
      previous = progress;
    });

    expect(previous).to.equal(1);

    expect(files).to.have.length(1);

    expect(files[0].name).to.equal('PLY');

    expect(files[0].vertices).to.eql(cube.vertices);
  });

  it('will parse a binary file (little endian encoding)', () =>
  {
    let previous = -1;
    const files = parse(cube.binaryLE, progress =>
    {
      expect(progress).to.be.gte(previous);
      previous = progress;
    });

    expect(previous).to.equal(1);

    expect(files).to.have.length(1);

    expect(files[0].name).to.equal('PLY');

    expect(files[0].vertices).to.eql(cube.vertices);
  });

  it('will parse a non-triangular-polygon file', () =>
  {
    let previous = -1;
    const files = parse(cube.ntp, progress =>
    {
      expect(progress).to.be.gte(previous);
      previous = progress;
    });

    expect(previous).to.equal(1);

    expect(files).to.have.length(1);

    expect(files[0].name).to.equal('PLY');

    expect(files[0].vertices.vectors).to.eql(cube.vertices.vectors);
    expect(files[0].vertices.indices).to.eql([
      2, 0, 1,
      1, 3, 2,
      4, 6, 7,
      7, 5, 4,
      1, 0, 4,
      4, 5, 1,
      3, 1, 5,
      5, 7, 3,
      2, 3, 7,
      7, 6, 2,
      0, 2, 6,
      6, 4, 0
    ]);
  });

  it('will parse benchy', () =>
  {
    const benchy = readFileSync(resolve('assets/ply/benchy.ply'));

    let previous = -1;
    const files = parse(benchy, progress =>
    {
      expect(progress).to.be.gte(previous);
      previous = progress;
    });

    expect(previous).to.equal(1);

    expect(files).to.have.length(1);

    expect(files[0].name).to.equal('PLY');

    const indices = createHash('sha256').update(new Float32Array(files[0].vertices.indices)).digest('hex');
    const vectors = createHash('sha256').update(new Float32Array(files[0].vertices.vectors)).digest('hex');

    expect(indices).to.equal('bb51b07199db9a8d77e9de2141b728a311bac249bce78477673eec1b1aeff631');
    expect(vectors).to.equal('34433c4ac106b94398722aa1eea22343f3f6ca8f95e2cf7363daba6010af5bc4');
  });
});