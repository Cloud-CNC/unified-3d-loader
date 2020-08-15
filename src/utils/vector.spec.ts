/**
 * @fileoverview Vector Utilities Unit Tests
 */

//Imports
import {expect} from 'chai';
import {normalize, rotate} from './vector';
import {round} from 'lodash';

/**
 * Rounded sqrt(1 / 3) (10 decimals)
 */
const sqrtThird = round(Math.sqrt(1 / 3), 10);

/**
 * Rounded `Math.SQRT2` (10 decimals)
 */
const sqrtTwo = round(Math.SQRT2, 10);

describe('vector utilities', () =>
{
  it('will normalize a vector', () =>
  {
    expect(normalize(0, 0, 0)).to.eql([0, 0, 0]);

    expect(normalize(10, 0, 0)).to.eql([1, 0, 0]);

    expect(normalize(0, 10, 0)).to.eql([0, 1, 0]);

    expect(normalize(0, 0, 10)).to.eql([0, 0, 1]);

    expect(normalize(10, 10, 10)).to.eql([sqrtThird, sqrtThird, sqrtThird]);

    expect(normalize(-10, -10, -10)).to.eql([-sqrtThird, -sqrtThird, -sqrtThird]);
  });

  it('will rotate point around non-axis-aligned line', () =>
  {
    const vector = rotate(Math.PI / 2, Math.PI / 4, Math.PI / 8, 2, 2, 2);

    expect(vector).to.eql([2.1795804271, -0.6488466976, 2.6131259298]);
  });

  it('will rotate point around axis-aligned (XZ) line', () =>
  {
    const vector = rotate(0, Math.PI / 4, 0, 2, 0, 0);

    expect(vector).to.eql([sqrtTwo, 0, -sqrtTwo]);
  });

  it('will rotate point around axis-aligned (XY) line', () =>
  {
    const vector = rotate(0, 0, Math.PI / 4, 0, 2, 0);

    expect(vector).to.eql([-sqrtTwo, sqrtTwo, 0]);
  });

  it('will rotate point around axis-aligned (YZ) line', () =>
  {
    const vector = rotate(Math.PI / 4, 0, 0, 0, 0, 2);

    expect(vector).to.eql([0, -sqrtTwo, sqrtTwo]);
  });
});