/**
 * @fileoverview Additive Manufacturing Format Parser Unit Tests
 */

//Imports
import {createHash} from 'crypto';
import {expect} from 'chai';
import {parse} from './amf';
import {readFileSync} from 'fs';
import {resolve} from 'path';

/**
 * Cube AMF
 */
const cube = {
  ascii: readFileSync(resolve('assets/amf/cube-ascii.amf')),
  big: readFileSync(resolve('assets/amf/cube-big.amf')),
  compressed: readFileSync(resolve('assets/amf/cube-compressed.amf')),
  multi: readFileSync(resolve('assets/amf/cube-multi.amf')),
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

describe('amf parser', () =>
{
  it('will parse ascii files', async () =>
  {
    const files = await parse(cube.ascii);

    expect(files).to.have.length(1);

    expect(files[0].name).to.equal('AMF');

    expect(files[0].vertices).to.eql(cube.vertices);

    expect(files[0].metadata).to.not.be.null;
    expect(files[0].metadata).to.eql({
      ObjectMetadata: 'object-metadata',
      mesh: {
        vertices: {
          vertex: {
            0: {
              coordinates: {
                CoordinateMetadata: 'coordinate-metadata-1'
              }
            },
            1: {
              coordinates: {
                CoordinateMetadata: 'coordinate-metadata-2'
              }
            }
          }
        }
      }
    });
  });

  it('will parse files with big units', async () =>
  {
    const files = await parse(cube.big);

    expect(files).to.have.length(1);

    expect(files[0].name).to.equal('AMF');

    expect(files[0].vertices.indices).to.eql(cube.vertices.indices);
    expect(files[0].vertices.vectors).to.eql(cube.vertices.vectors.map(vertice => 1000 * vertice));

    expect(files[0].metadata).to.not.be.null;
    expect(files[0].metadata).to.eql({
      ObjectMetadata: 'object-metadata',
      mesh: {
        vertices: {
          vertex: {
            0: {
              coordinates: {
                CoordinateMetadata: 'coordinate-metadata-1'
              }
            },
            1: {
              coordinates: {
                CoordinateMetadata: 'coordinate-metadata-2'
              }
            }
          }
        }
      }
    });
  });

  it('will parse compressed files', async () =>
  {
    const files = await parse(cube.compressed);

    expect(files).to.have.length(1);

    expect(files[0].name).to.equal('AMF');

    expect(files[0].vertices).to.eql(cube.vertices);

    expect(files[0].metadata).to.not.be.null;
    expect(files[0].metadata).to.eql({
      ObjectMetadata: 'object-metadata',
      mesh: {
        vertices: {
          vertex: {
            0: {
              coordinates: {
                CoordinateMetadata: 'coordinate-metadata-1'
              }
            },
            1: {
              coordinates: {
                CoordinateMetadata: 'coordinate-metadata-2'
              }
            }
          }
        }
      }
    });
  });

  it('will parse compressed multi object files', async () =>
  {
    const files = await parse(cube.multi);

    expect(files).to.have.length(2);

    expect(files[0].name).to.equal('AMF');

    expect(files[0].vertices).to.eql(cube.vertices);

    expect(files[0].metadata).to.not.be.null;
    expect(files[0].metadata).to.eql({
      ObjectMetadata: 'object-metadata',
      mesh: {
        vertices: {
          vertex: {
            0: {
              coordinates: {
                CoordinateMetadata: 'coordinate-metadata-1'
              }
            },
            1: {
              coordinates: {
                CoordinateMetadata: 'coordinate-metadata-2'
              }
            }
          }
        }
      }
    });

    expect(files[1].name).to.equal('AMF');

    expect(files[1].vertices.indices).to.eql(cube.vertices.indices);
    expect(files[1].vertices.vectors).to.eql(cube.vertices.vectors.map((value, index) => index % 3 == 2 ? value + 2 : value));

    expect(files[1].metadata).to.not.be.null;
    expect(files[1].metadata).to.eql({
      ObjectMetadata: 'object-metadata',
      mesh: {
        vertices: {
          vertex: {
            0: {
              coordinates: {
                CoordinateMetadata: 'coordinate-metadata-1'
              }
            },
            1: {
              coordinates: {
                CoordinateMetadata: 'coordinate-metadata-2'
              }
            }
          }
        }
      }
    });
  });

  it('will parse benchy', async () =>
  {
    const benchy = readFileSync(resolve('assets/amf/benchy.amf'));

    const files = await parse(benchy);

    expect(files).to.have.length(1);

    expect(files[0].name).to.equal('AMF');

    const indices = createHash('sha256').update(new Float32Array(files[0].vertices.indices)).digest('hex');
    const vectors = createHash('sha256').update(new Float32Array(files[0].vertices.vectors)).digest('hex');

    expect(indices).to.equal('9bd26437e542783758695665786613df423adccc32e9698fc89cd019176f1732');
    expect(vectors).to.equal('01fd426e321f2a71cb375c2c1e07c49aa6f8cf38edc124c4806330b67a4af125');
  });
});