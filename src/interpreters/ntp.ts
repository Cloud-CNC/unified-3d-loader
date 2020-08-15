/**
 * @fileoverview Non-Triangular Polygon Interpreter
 * 
 * This is a very math-heavy file; you've been warned!
 * 
 * Earcut along with 90%+ of polygon triangulators don't support non-planar polygons,
 * so we need to find those and throw errors.
 * See https://github.com/mapbox/earcut/issues/21#issuecomment-100552296
 * 
 * To test for planar polygons, we'll calculate a plane based on the first 3 vertices and
 * check if the remaining vertices lie on this plane.
 * 
 * Once we know the polygon is planar, we must convert it to a 2D plane using 3D rotation matrixes,
 * because Earcut doesn't support true 3D. After earcut has finished, we can directly return
 * indices and let the frontend do its thing with those indices without transforming them.
 */

//Imports
import {rotate} from '../utils/vector';
import {vectorsToPlane, onPlane} from '../utils/plane';
import earcut from 'earcut';

//Export
/**
 * Interpret non-triangular polygons
 * 
 * Used to convert quadrilaterals, pentagons, hexagons, etc. into triangles
 */
export default (vertices: number[]): number[] =>
{
  //Get vector components
  const [x1, y1, z1, x2, y2, z2, x3, y3, z3] = vertices;

  //Calculate the bounding plane
  const plane = vectorsToPlane(x1, y1, z1, x2, y2, z2, x3 ,y3, z3);

  //Ensure all vertices beyond the first 3 lie along the plane (Planar-ness prerequisite)
  for (let i = 9; i < vertices.length; i += 3)
  {
    if (!onPlane(plane, vertices[i], vertices[i + 1], vertices[i + 2]))
    {
      throw new Error('[NTP] Cannot interpret non-planar polygons!');
    }
  }

  //Calculate transformation angles (These will be used to reduce the 3D plane to a normal 2D plane)
  const x = Math.atan(plane.b / plane.c);
  const y = Math.atan(plane.a / plane.c);
  const z = Math.atan(plane.a / plane.b);

  //Flatten to 2D
  const flattened: number[] = [];

  for (let i = 0; i < vertices.length; i += 3)
  {
    //Rotate the coordinates by the transformation angles
    const vector = rotate(x, y, z, vertices[i], vertices[i + 1], vertices[i + 2]);

    //Remove the last component finalizing the flattenning
    vector.pop();

    //Add the flattened vector
    flattened.push(...vector);
  }

  //Earcut (Subdivide polygon)
  const divided = earcut(flattened);

  //Reverse indice order for each triangle (Otherwise normals are wrong)
  const reversed = [];
  for (let i = 0; i < divided.length; i += 3)
  {
    reversed.push(divided[i + 2], divided[i + 1], divided[i]);
  }

  return reversed;
};