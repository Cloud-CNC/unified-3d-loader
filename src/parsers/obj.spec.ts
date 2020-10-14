/**
 * @fileoverview OBJ Parser Unit Tests
 */

//Imports
import {createHash} from 'crypto';
import {expect} from 'chai';
import {parse} from './obj';
import {readFileSync} from 'fs';
import {resolve} from 'path';

/**
 * Cube OBJ
 */
const cube = {
  group: readFileSync(resolve('assets/obj/cube-group.obj')),
  ntp: readFileSync(resolve('assets/obj/cube-ntp.obj')),
  object: readFileSync(resolve('assets/obj/cube-object.obj')),
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

describe('obj parser', () =>
{
  it('will parse files with group format', () =>
  {
    let previous = -1;
    const files = parse(cube.group, 'group-only', progress =>
    {
      expect(progress).to.be.gte(previous);
      previous = progress;
    });

    expect(previous).to.equal(1);

    expect(files).to.have.length(1);

    expect(files[0].name).to.equal('CUBE');

    expect(files[0].vertices).to.eql(cube.vertices);
  });

  it('will parse files with object format', () =>
  {
    let previous = -1;
    const files = parse(cube.object, 'object-only', progress =>
    {
      expect(progress).to.be.gte(previous);
      previous = progress;
    });

    expect(previous).to.equal(1);

    expect(files).to.have.length(1);

    expect(files[0].name).to.equal('CUBE');

    expect(files[0].vertices).to.eql(cube.vertices);
  });

  it('will parse files with hybrid format', () =>
  {
    //Group
    let previous1 = -1;
    const files1 = parse(cube.group, 'hybrid', progress =>
    {
      expect(progress).to.be.gte(previous1);
      previous1 = progress;
    });

    expect(previous1).to.equal(1);

    expect(files1).to.have.length(1);

    expect(files1[0].name).to.equal('CUBE');

    expect(files1[0].vertices).to.eql(cube.vertices);

    //Object
    let previous2 = -1;
    const files2 = parse(cube.object, 'hybrid', progress =>
    {
      expect(progress).to.be.gte(previous2);
      previous2 = progress;
    });

    expect(previous2).to.equal(1);

    expect(files2).to.have.length(1);

    expect(files2[0].name).to.equal('CUBE');

    expect(files2[0].vertices).to.eql(cube.vertices);
  });

  it('will parse a non-triangular-polygon file', () =>
  {
    let previous = -1;
    const files = parse(cube.ntp, 'group-only', progress =>
    {
      expect(progress).to.be.gte(previous);
      previous = progress;
    });

    expect(previous).to.equal(1);

    expect(files[0].name).to.equal('CUBE');

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
    const benchy = readFileSync(resolve('assets/obj/benchy.obj'));

    let previous = -1;
    const files = parse(benchy, 'group-only', progress =>
    {
      expect(progress).to.be.gte(previous);
      previous = progress;
    });

    expect(previous).to.equal(1);

    expect(files).to.have.length(1);

    expect(files[0].name).to.equal('Benchy');

    const indices = createHash('sha256').update(new Float32Array(files[0].vertices.indices)).digest('hex');
    const vectors = createHash('sha256').update(new Float32Array(files[0].vertices.vectors)).digest('hex');

    expect(indices).to.equal('ec989309c9786f54bc71405a2c12b2dbb79c08e1b97bb4f1d18dcd0ef105c17f');
    expect(vectors).to.equal('02a703debdb2fb941e1bf55ba681bdfb7df13a643117ca1d03196cf7d496221d');
  });
});