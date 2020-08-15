/**
 * @fileoverview Plane Utilities
 * 
 * This is a very math-heavy file; you've been warned!
 */

/**
 * A plane in point-normal form (`ax + by + cz + d = 0`)
 */
export interface Plane
{
  /**
   * The `X-axis` coefficient
   */
  a: number,

  /**
   * The `Y-axis` coefficient
   */
  b: number,

  /**
   * The `Z-axis` coefficient
   */
  c: number,

  /**
   * The offset (Normal to the plane at the origin position)
   */
  d: number
}

/**
 * Calculate the coefficients of a normal-point planar equation bound by the provided vertices
 * @param x1 The first vector's `X` componenet
 * @param y1 The first vector's `Y` componenet
 * @param z1 The first vector's `Z` componenet
 * @param x2 The second vector's `X` componenet
 * @param y2 The second vector's `Y` componenet
 * @param z2 The second vector's `Z` componenet
 * @param x3 The third vector's `X` componenet
 * @param y3 The third vector's `Y` componenet
 * @param z3 The third vector's `Z` componenet
 * 
 * Many interpreters, parsers, and utilities use planes to manipulate coordinates, so we should be
 * able to calculate a plane from the 3 vertices (They'll always form a plane). It's also helpful to
 * test if the remaining vertices lie along that plane to check for planar-ness. While this file
 * originally used Cramer's rule for solving the plane's coefficients, I found that the following
 * method simpler and faster: https://www.khronos.org/opengl/wiki/Calculating_a_Surface_Normal
 */
export const vectorsToPlane = (
  x1: number, y1: number, z1: number,
  x2: number, y2: number, z2: number,
  x3: number, y3: number, z3: number): Plane =>
{
  //Subtract vectors 1 & 2, 3 & 1
  const ux = x2 - x1; //Vector 1 & 2 X
  const uy = y2 - y1; //Vector 1 & 2 Y
  const uz = z2 - z1; //Vector 1 & 2 Z
  const vx = x3 - x1; //Vector 3 & 1 X
  const vy = y3 - y1; //Vector 3 & 1 Y
  const vz = z3 - z1; //Vector 3 & 1 Z

  //Calculate coefficients
  const a = uy * vz - vy * uz;
  const b = vx * uz - ux * vz;
  const c = ux * vy - uy * vx;

  //Calculate the offset
  const d = -(a * x1 + b * y1 + c * z1);

  return {a, b, c, d};
};

/**
 * Test if a point is on the provided plane
 * @param plane The plane to test against
 * @param x The testing point's `X` position
 * @param y The testing point's `Y` position
 * @param z The testing point's `Z` position
 * 
 * When testing points to see if they're on the plane, we will use the point-normal form of the plane
 * equation for normal cases and use <3D geometry for special cases such as vertical planes that cause
 * all kinds off errors if we stuck with the point-normal equation. The <3D geometry was mostly created
 * via plotting planes in GeoGebra's 3D graphing tool, analyzing their 2D cross-section with Desmos' 2D
 * graphing tool, and a healthy knowledge of linear equations.
 */
export const onPlane = (plane: Plane, x: number, y: number, z: number): boolean =>
{
  //Start with evaluating all axes
  const axes = {
    X: true,
    Y: true,
    Z: true
  };

  //If the plane's `a` is `0`, the plane is aligned with the `X` axis, so don't evaluate it
  if (plane.a == 0)
  {
    axes.X = false;
  }

  //If the plane's `b` is `0`, the plane is aligned with the `Y` axis, so don't evaluate it
  if (plane.b == 0)
  {
    axes.Y = false;
  }

  //If the plane's `c` is `0`, the plane is aligned with the `Z` axis, so don't evaluate it
  if (plane.c == 0)
  {
    axes.Z = false;
  }

  //Evaluate dual axes (Parallel with 1 axis; 2D math)
  if (!axes.X && axes.Y && axes.Z)
  {
    /**
     * 2D interpretation of the plane (Same coefficient names)
     * z = -(b/c) * y + (d/c)
     */
    const line = -(plane.b / plane.c) * y + (plane.d / plane.c);

    return z == line;
  }
  else if (axes.X && !axes.Y && axes.Z)
  {
    /**
     * 2D interpretation of the plane (Same coefficient names)
     * x = -(c/a) * y - (d/a)
     */
    const line = -(plane.c / plane.a) * y + (plane.d / plane.a);

    return z == line;
  }
  else if (axes.X && axes.Y && !axes.Z)
  {
    /**
     * 2D interpretation of the plane (Same coefficient names)
     * y = -(a/b) * x + (d/b)
     */
    const line = -(plane.a / plane.b) * x - (plane.d / plane.b);

    return y == line;
  }
  //Evaluate single axis (Parallel with 2 axes; 1D math)
  else if (axes.X && !axes.Y && !axes.Z)
  {
    /**
     * 1D interpretation of the plane (Same coefficient names)
     * x = -(d/a)
     */
    return x == -(plane.d / plane.a);
  }
  else if (!axes.X && axes.Y && !axes.Z)
  {
    /**
     * 1D interpretation of the plane (Same coefficient names)
     * x = -(d/b)
     */
    return y == -(plane.d / plane.b);
  }
  else if (!axes.X && !axes.Y && axes.Z)
  {
    /**
     * 1D interpretation of the plane (Same coefficient names)
     * x = -(d/c)
     */
    return z == -(plane.d / plane.c);
  }
  //Normal case (Evaluate all 3 axes; 3D math)
  else
  {
    return plane.a * x + plane.b * y + plane.c * z + plane.d == 0;
  }
};