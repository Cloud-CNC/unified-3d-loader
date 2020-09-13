/**
 * @fileoverview 3D Manufacturing Format Parser Unit Tests
 */

//Imports
import {createHash} from 'crypto';
import {expect} from 'chai';
import {multiply} from 'mathjs';
import {parse} from './3mf';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import {round} from 'lodash';

/**
 * Cube 3MF
 */
const cube = {
  big: readFileSync(resolve('assets/3mf/cube-big.3mf')),
  single: readFileSync(resolve('assets/3mf/cube-single.3mf')),
  transform: readFileSync(resolve('assets/3mf/cube-transform.3mf')),
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
      5, 6, 4
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

describe('3mf parser', () =>
{
  it('will parse single object files', async () =>
  {
    let previous = -1;
    const files = await parse(cube.single, progress =>
    {
      expect(progress).to.be.greaterThan(previous);
      previous = progress;
    });

    expect(files).to.have.length(1);

    expect(files[0].name).to.equal('3MF');

    expect(files[0].vertices).to.eql(cube.vertices);

    expect(files[0].metadata).to.not.be.null;
    expect(files[0].metadata).to.eql({
      metadatagroup: {
        ObjectMetadata: 'object-metadata'
      }
    });
  });

  it('will parse files with big units', async () =>
  {
    let previous = -1;
    const files = await parse(cube.big, progress =>
    {
      expect(progress).to.be.greaterThan(previous);
      previous = progress;
    });

    expect(files).to.have.length(1);

    expect(files[0].name).to.equal('3MF');

    expect(files[0].vertices.indices).to.eql(cube.vertices.indices);
    expect(files[0].vertices.vectors).to.eql(cube.vertices.vectors.map(vertice => 1000 * vertice));

    expect(files[0].metadata).to.not.be.null;
    expect(files[0].metadata).to.eql({
      metadatagroup: {
        ObjectMetadata: 'object-metadata'
      }
    });
  });

  it('will parse single object files with transformations', async () =>
  {
    //Calculate transformed normals and vertices
    const matrix = [
      [0.8047379004, -0.310617201, 0.5058793003],
      [0.5058793003, 0.8047379004, -0.310617201],
      [-0.310617201, 0.5058793003, 0.8047379004],
    ];

    //Transform vertices
    const vectors = [];
    for (let i = 0; i < cube.vertices.vectors.length; i += 3)
    {
      //Get components
      const [x, y, z] = cube.vertices.vectors.slice(i, i + 3);

      //@ts-ignore The multiply method can return a 1D array if one of the inputs is 1 wide
      let vector: number[] = multiply(matrix, [x, y, z]);

      //Round to remove some floating-point imprecision from the matrix math
      vector = vector.map(component => round(component, 10));

      //Add the component
      vectors.push(...vector);
    }

    let previous = -1;
    const files = await parse(cube.transform, progress =>
    {
      expect(progress).to.be.greaterThan(previous);
      previous = progress;
    });

    expect(files).to.have.length(1);

    expect(files[0].name).to.equal('3MF');

    expect(files[0].vertices.vectors).to.eql(vectors);
    expect(files[0].vertices.indices).to.eql(cube.vertices.indices);

    expect(files[0].metadata).to.not.be.null;
    expect(files[0].metadata).to.eql({
      metadatagroup: {
        ObjectMetadata: 'object-metadata'
      }
    });
  });

  it('will parse benchy', async () =>
  {
    const benchy = readFileSync(resolve('assets/3mf/benchy.3mf'));

    let previous = -1;
    const files = await parse(benchy, progress =>
    {
      expect(progress).to.be.greaterThan(previous);
      previous = progress;
    });

    expect(files).to.have.length(1);

    expect(files[0].name).to.equal('3MF');

    const indices = createHash('sha256').update(new Float32Array(files[0].vertices.indices)).digest('hex');
    const vectors = createHash('sha256').update(new Float32Array(files[0].vertices.vectors)).digest('hex');

    expect(indices).to.equal('4b141f0c4e54ecf9b3b3dd2765243b2d570bccec1684628277f24d322c64fef6');
    expect(vectors).to.equal('d69944e9d9aeb6391b5fa1b355f4e86478184c49c886e6b9efb6bca2a095b852');
  });
});