/**
 * @fileoverview Normal Utilities
 * 
 * This is a very math-heavy file; you've been warned!
 */

//Imports
import {normalize} from './vector';
import {vectorsToPlane} from './plane';

/**
 * Calculate face normals
 * @param vertices The vertices to calculate face normals for
 * @returns An array with a length `1/3` of the input
 * 
 * In order to calculate face normals, we calculate the equation for a plane in normal-point form and the coefficients
 * form the normal vector. We then have to normalize each vector because thats what computers expect for normals.
 * See https://en.wikipedia.org/wiki/Normal_(geometry)#Calculating_a_surface_normal
 */
export const calculateFaceNormals = (vertices: number[]): number[] =>
{
  const normals = [];

  //Iterate over the vertices
  for (let i = 0; i < vertices.length; i += 9)
  {
    //Calculate a bounding plane (Perpendicular to the normal)
    const plane = vectorsToPlane(
      vertices[i], vertices[i + 1], vertices[i + 2],
      vertices[i + 3], vertices[i + 4], vertices[i + 5],
      vertices[i + 6], vertices[i + 7], vertices[i + 8]);

    //Normalize the normal vector
    const [a, b, c] = normalize(plane.a, plane.b, plane.c);

    normals.push(a, b, c);
  }

  return normals;
};