/**
 * @fileoverview Contains Utility Unit Tests
 */

//Imports
import {contains} from './array';
import {expect} from 'chai';

describe('array utilities', () =>
{
  it('ensure the contains function works', () =>
  {
    expect(contains([1, 2, 3, 4, 5], [1, 2, 3])).to.be.true;
    expect(contains([1, 2, 3, 4, 5], [2, 3, 4])).to.be.true;
    expect(contains([1, 2, 3, 4, 5], [3, 4, 5])).to.be.true;
    expect(contains([1, 2, 3, 4, 5], [1, 2, 3, 4, 5])).to.be.true;

    expect(contains([1, 2, 3, 4, 5], [6, 7, 8])).to.be.false;
    expect(contains([1, 2, 3], [1, 2, 3, 4, 5])).to.be.false;
  });
});