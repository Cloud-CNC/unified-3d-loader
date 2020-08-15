/**
 * Non-Triangular Polygon Interpreter Unit Tests
 */

//Imports
import {expect} from 'chai';
import ntp from './ntp';

describe('non-triangular polygon interpreter', () =>
{
  it('will throw errors when passed a non-planar (XZ) polygon', done =>
  {
    try
    {
      //XZ square (With 1 extruded/raised corner)
      ntp([
        //Top left corner (Raised)
        -1, 1, 1,

        //Top right corner
        1, 0, 1,

        //Bottom right corner
        1, 0, -1,

        //Bottom left corner
        -1, 0, -1
      ]);

      throw new Error('Shouldn\'t get this far!');
    }
    catch (err)
    {
      expect(err.message).to.equal('[NTP] Cannot interpret non-planar polygons!');
      done();
    }
  });

  it('will throw errors when passed a non-planar (XY) polygon', () =>
  {
    try
    {
      //XY square (With 1 extruded/raised corner)
      ntp([
        //Top left corner (Raised)
        -1, 1, 1,

        //Top right corner
        1, 1, 0,

        //Bottom right corner
        1, -1, 0,

        //Bottom left corner
        -1, -1, 0
      ]);

      throw new Error('Shouldn\'t get this far!');
    }
    catch (err)
    {
      expect(err.message).to.equal('[NTP] Cannot interpret non-planar polygons!');
    }
  });

  it('will throw errors when passed a non-planar (YZ) polygon', () =>
  {
    try
    {
      //YZ square (With 1 extruded/raised corner)
      ntp([
        //Top left corner (Raised)
        1, -1, 1,

        //Top right corner
        0, 1, 1,

        //Bottom right corner
        0, 1, -1,

        //Bottom left corner
        0, -1, -1
      ]);

      throw new Error('Shouldn\'t get this far!');
    }
    catch (err)
    {
      expect(err.message).to.equal('[NTP] Cannot interpret non-planar polygons!');
    }
  });

  it('will interpret non-axis-aligned planar polygon', () =>
  {
    //Random coordinates
    const triangles = ntp([
      1, 1, 1,
      1, -1, -1,
      -1, 0, 0,
      2, 2, 2
    ]);

    expect(triangles).to.eql([2, 3, 0, 0, 1, 2]);
  });

  it('will interpret axis-aligned (XZ) planar polygon', () =>
  {
    //XZ square
    const triangles = ntp([
      //Top left corner
      -1, 0, 1,

      //Top right corner
      1, 0, 1,

      //Bottom right corner
      1, 0, -1,

      //Bottom left corner
      -1, 0, -1
    ]);

    expect(triangles).to.eql([3, 0, 1, 1, 2, 3]);
  });

  it('will interpret axis-aligned (XY) planar polygon', () =>
  {
    //XY square
    const triangles = ntp([
      //Top left corner
      -1, 1, 0,

      //Top right corner
      1, 1, 0,

      //Bottom right corner
      1, -1, 0,

      //Bottom left corner
      -1, -1, 0
    ]);

    expect(triangles).to.eql([3, 0, 1, 1, 2, 3]);
  });

  it('will interpret axis-aligned (YZ) planar polygon', () =>
  {
    //YZ square
    const triangles = ntp([
      //Top left corner
      0, -1, 1,

      //Top right corner
      0, 1, 1,

      //Bottom right corner
      0, 1, -1,

      //Bottom left corner
      0, -1, -1
    ]);

    expect(triangles).to.eql([3, 0, 1, 1, 2, 3]);
  });
});