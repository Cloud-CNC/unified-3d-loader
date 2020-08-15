/**
 * @fileoverview Metadata Utility
 */

/**
 * Extract metadata from a parsed XML document
 * @param document The parsed XML document
 */
export const extractMetadata = (document: object): any =>
{
  const extract = (object: object): any =>
  {
    //Scoped metadata (Relative the the scoped object)
    const metadata: any = {};

    //Exit condition and race condition checking
    if (Object.keys(object).length > 0)
    {
      //Traverse subordinate elements via breadth-first search
      for (const [key, value] of Object.entries(object))
      {
        //Metadata element
        if (key == 'metadata')
        {
          if (value instanceof Array)
          {
            for (const item of value)
            {
              //Get the key
              const key = item['@_name'] != null ? item['@_name'] : item['@_type'];

              //Set the metadata
              if (key != null &&
                item['#text'] != null &&
                item['#text'].length > 0)
              {
                metadata[key] = item['#text'];
              }
            }
          }
          else
          {
            //Get the key
            const key = value['@_name'] != null ? value['@_name'] : value['@_type'];

            //Set the metadata
            if (key != null &&
              value['#text'] != null &&
              value['#text'].length > 0)
            {
              metadata[key] = value['#text'];
            }
          }
        }
        //Recur
        else if (typeof value == 'object')
        {
          //Get the child metadata
          const childMetadata = extract(value);

          //Set the metadata (If not empty object)
          if (Object.keys(childMetadata).length > 0)
          {
            metadata[key] = childMetadata;
          }
        }
      }
    }

    return metadata;
  };

  return extract(document);
};