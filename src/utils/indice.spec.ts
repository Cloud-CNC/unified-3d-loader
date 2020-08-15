/**
 * @fileoverview Indice Utility Unit Tests
 */

//Imports
import {expect} from 'chai';
import {deindex, index} from './indice';

describe('indice utilities', () =>
{
  it('will de-index vectors', () =>
  {
    const vectors = deindex({
      indices: [0, 1, 1, 0],
      vectors: [0, 0, 0, 1, 1, 1]
    });

    expect(vectors).to.eql([0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0]);
  });

  it('will index vectors', () =>
  {
    const {indices, vectors} = index([0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0]);

    expect(indices).to.eql([0, 1, 1, 0]);
    expect(vectors).to.eql([0, 0, 0, 1, 1, 1]);
  });
});