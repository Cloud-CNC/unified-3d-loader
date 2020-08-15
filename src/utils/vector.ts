/**
 * @fileoverview Vector Utilities
 * 
 * This is a very math-heavy file; you've been warned!
 */

//Imports
import {multiply} from 'mathjs';
import {round} from 'lodash';

/**
 * Normalize a vector (Convert a non-unit vector to a unit vector)
 * @param x The vector's `X` component
 * @param y The vector's `Y` component
 * @param z The vector's `Z` component
 */
export const normalize = (x: number, y: number, z: number): [number, number, number] =>
{
  //Calculate the magnitude
  const magnitude = Math.sqrt(x ** 2 + y ** 2 + z ** 2);

  //Normalize the vector
  if (magnitude == 0)
  {
    return [0, 0, 0];
  }
  else
  {
    const uX = round(x / magnitude, 10);
    const uY = round(y / magnitude, 10);
    const uZ = round(z / magnitude, 10);

    return [uX, uY, uZ];
  }
};

/**
 * Rotate a vector by a given number of radians in all 3 axis simultantiously
 * @param rX The `X-axis` rotation (Radians)
 * @param rY The `Y-axis` rotation (Radians)
 * @param rZ The `Z-axis` rotation (Radians)
 * @param x The `X` component of the vector
 * @param y The `Y` component of the vector
 * @param z The `Z` component of the vector
 * @return 3x1 matrix (`X, Y, Z`)
 * 
 * The `yaw`, `pitch`, and `roll` matrixes are multiplied together to allow for complex,
 * multi-axis rotations. See https://en.wikipedia.org/wiki/Rotation_matrix#General_rotations
 */
export const rotate = (rX: number, rY: number, rZ: number, x: number, y: number, z: number): number[] =>
{
  //Simplify transformation angles
  rX = rX % (2 * Math.PI);
  rY = rY % (2 * Math.PI);
  rZ = rZ % (2 * Math.PI);

  //Convert negative angles to positive
  rX = rX < 0 ? (2 * Math.PI) + rX : rX;
  rY = rY < 0 ? (2 * Math.PI) + rY : rY;
  rZ = rZ < 0 ? (2 * Math.PI) + rZ : rZ;

  //Compile matrices
  const transformXYZ = multiply(multiply([
    [1, 0, 0],
    [0, Math.cos(rX), -Math.sin(rX)],
    [0, Math.sin(rX), Math.cos(rX)]
  ], [
    [Math.cos(rY), 0, Math.sin(rY)],
    [0, 1, 0],
    [-Math.sin(rY), 0, Math.cos(rY)]
  ]), [
    [Math.cos(rZ), -Math.sin(rZ), 0],
    [Math.sin(rZ), Math.cos(rZ), 0],
    [0, 0, 1]
  ]);

  //@ts-ignore The multiply method can return a 1D array if one of the inputs is 1 wide
  let vector: number[] = multiply(transformXYZ, [x, y, z]);

  //Round to remove some floating-point imprecision from the matrix math
  vector = vector.map(component => round(component, 10));

  return vector;
};