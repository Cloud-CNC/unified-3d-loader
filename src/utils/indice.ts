/**
 * @fileoverview Indice Utility
 */

//Imports
import {IndexedVectorList} from '../types';

/**
 * De-index all indices/pointers in `a` to vectors in `b`
 * @param indices Array of indices/pointers to resolve
 * @param items Array containing vectors to use for resolving
 * @returns `vectors`
 */
export const deindex = (items: IndexedVectorList): number[] =>
{
  //Make sure the vector length is what we expect
  if (items.vectors.length % 3 != 0)
  {
    throw new Error('[Indice Utility] The provided vector array has an invalid length (Deindex)!');
  }

  const dereferenced = [];

  for (let i = 0; i < items.indices.length; i++)
  {
    //Calculate the vector index (1 number in `items.indices` maps to 3 numbers in `items.vectors`)
    const index = items.indices[i] * 3;

    dereferenced.push(items.vectors[index], items.vectors[index + 1], items.vectors[index + 2]);
  }

  return dereferenced;
};

/**
 * Index all vectors in `vectors`
 * @param vectors Array of vectors to index
 */
export const index = (vectors: number[]): IndexedVectorList =>
{
  //Make sure the vector length is what we expect
  if (vectors.length % 3 != 0)
  {
    throw new Error('[Indice Utility] The provided array has an invalid length (Index)!');
  }

  const indices = [];
  const uniqueVectors = [];

  //Index each vector
  for (let i = 0; i < vectors.length; i += 3)
  {    
    //Check if the current vector has already been indexed
    let index = -1;
    for (let j = 0; j < uniqueVectors.length; j += 3)
    {
      //Test to see if the current vector is the current unique vector
      if (vectors[i] == uniqueVectors[j] &&
        vectors[i + 1] == uniqueVectors[j + 1] &&
        vectors[i + 2] == uniqueVectors[j + 2])
      {
        index = j;

        break;
      }
    }

    //The vector has not been indexed, so add it and its indice
    if (index == -1)
    {
      //Add the vector
      uniqueVectors.push(vectors[i], vectors[i + 1], vectors[i + 2]);

      //Add the indice ([].length = end, we want start; 3 vectors map to 1 indice)
      indices.push((uniqueVectors.length - 3) / 3);
    }
    //The vector has already been indexed, so add its indice
    else
    {
      //Add the indice (3 vectors map to 1 indice)
      indices.push(index / 3);
    }
  }

  return {
    indices,
    vectors: uniqueVectors
  };
};