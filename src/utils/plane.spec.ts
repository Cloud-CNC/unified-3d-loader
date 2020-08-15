/**
 * @fileoverview Plane Utilities Unit Tests
 */

//Imports
import {expect} from 'chai';
import {vectorsToPlane, onPlane} from './plane';

describe('plane utilities', () =>
{
  it('will calculate a non-axis-aligned plane from 3 vectors', () =>
  {
    const plane = vectorsToPlane(
      1, 1, 1,
      1, -1, -1,
      -1, 0, 1
    );

    expect(plane).to.eql({
      a: -2,
      b: 4,
      c: -4,
      d: 2
    });
  });

  it('will calculate a axis-aligned (XZ) plane from 3 vectors', () =>
  {
    const plane = vectorsToPlane(
      -1, 0, 1,
      1, 0, 1,
      1, 0, -1
    );

    expect(plane).to.eql({
      a: -0,
      b: 4,
      c: 0,
      d: -0
    });
  });

  it('will calculate a axis-aligned (XY) plane from 3 vectors', () =>
  {
    const plane = vectorsToPlane(
      -1, 1, 0,
      1, 1, 0,
      1, -1, 0
    );

    expect(plane).to.eql({
      a: 0,
      b: 0,
      c: -4,
      d: -0
    });
  });

  it('will calculate a axis-aligned (YZ) plane from 3 vectors', () =>
  {
    const plane = vectorsToPlane(
      0, -1, 1,
      0, 1, 1,
      0, 1, -1
    );

    expect(plane).to.eql({
      a: -4,
      b: 0,
      c: 0,
      d: -0
    });
  });

  it('will detect a point on a non-axis-aligned plane', () =>
  {
    const plane = {
      a: 0,
      b: 0,
      c: 0,
      d: 0
    };

    expect(onPlane(plane, 0, 0, 0)).to.be.true;
  });

  it('will detect a point on an axis-aligned (XZ) plane', () =>
  {
    const plane = {
      a: 0,
      b: 4,
      c: 0,
      d: 0
    };

    expect(onPlane(plane, -1, 0, -1)).to.be.true;
  });

  it('will detect a point on an axis-aligned (XY) plane', () =>
  {
    const plane = {
      a: 0,
      b: 0,
      c: 4,
      d: 0
    };

    expect(onPlane(plane, -1, -1, 0)).to.be.true;
  });

  it('will detect a point on an axis-aligned (YZ) plane', () =>
  {
    const plane = {
      a: -4,
      b: 0,
      c: 0,
      d: 0
    };

    expect(onPlane(plane, 0, -1, -1)).to.be.true;
  });
});