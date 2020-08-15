/**
 * @fileoverview PLY Parser Utilities Unit Tests
 */

//Imports
import {categorizeFile, parseElements, NumericTypes} from './utils';
import {expect} from 'chai';
import {readFileSync} from 'fs';
import {resolve} from 'path';

/**
 * Cube PLY
 */
const cube = {
  ascii: readFileSync(resolve('assets/ply/cube-ascii.ply'), 'utf-8'),
  binaryBE: readFileSync(resolve('assets/ply/cube-binary-be.ply'), 'utf-8'),
  binaryLE: readFileSync(resolve('assets/ply/cube-binary-le.ply'), 'utf-8'),
  elements: [
    {
      name: 'vertex',
      count: 8,
      offset: 0,
      properties: [
        {
          name: 'x',
          list: false,
          type: NumericTypes.FLOAT
        },
        {
          name: 'y',
          list: false,
          type: NumericTypes.FLOAT
        },
        {
          name: 'z',
          list: false,
          type: NumericTypes.FLOAT
        }
      ]
    },
    {
      name: 'face',
      count: 12,
      offset: 8,
      properties: [
        {
          name: 'vertex_indices',
          list: true,
          type: NumericTypes.INT,
          countType: NumericTypes.UCHAR
        }
      ]
    }
  ]
};

describe('ply parser utilities', () =>
{
  it('will categorize an ascii file', () =>
  {
    const category = categorizeFile(cube.ascii);

    expect(category).to.equal('ascii');
  });

  it('will categorize a binary file (big endian encoding)', () =>
  {
    const category = categorizeFile(cube.binaryBE);

    expect(category).to.equal('binary-be');
  });

  it('will categorize a binary file (little endian encoding)', () =>
  {
    const category = categorizeFile(cube.binaryLE);

    expect(category).to.equal('binary-le');
  });

  it('will parse an ascii file header elements', () =>
  {
    const elements = parseElements(cube.ascii);

    expect(elements).to.eql(cube.elements);
  });

  it('will parse a binary file header elements (big endian encoding)', () =>
  {
    const elements = parseElements(cube.binaryBE);

    expect(elements).to.eql(cube.elements);
  });

  it('will parse a binary file header elements (little endian encoding)', () =>
  {
    const elements = parseElements(cube.binaryLE);

    expect(elements).to.eql(cube.elements);
  });
});