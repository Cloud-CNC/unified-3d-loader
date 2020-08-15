/**
 * @fileoverview Array Utilities
 */

/**
 * Returns if `items` appears in `array`
 * @param array 
 * @param items 
 */
export const contains = <T>(array: Array<T>, items: Array<T>): boolean =>
{
  //Iterate over all possible starting positions
  for (let i = 0; i < (array.length - items.length) + 1; i++)
  {
    //Test if the current starting position satisfies the provided arguments
    let match = true;
    for (let j = 0; j < items.length; j++)
    {
      //If even one item doesn't match, use short-circuit logic and move on
      if (array[i + j] != items[j])
      {
        match = false;

        break;
      }
    }

    //If we found a match, return the index
    if (match)
    {
      return true;
    }
  }

  return false;
};