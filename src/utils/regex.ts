/**
 * @fileoverview Regular Expression Utilities
 */

/**
 * Extract text using a local regular expression safely
 * @param raw The raw string to execute the regex upon
 * @param regex The regex to execute
 * @param error An error to be thrown if there are no matches
 */
export const extractLocal = (raw: string, regex: RegExp, error: undefined | Error): string[] =>
{
  //Make sure the regex is local
  if (regex.flags.includes('g'))
  {
    throw new Error('[Regex Utility] The passed regular expression is not local! (Try "extractGlobal" instead)');
  }
  else
  {
    //Parse
    const parsed = raw.match(regex);

    //Handle errors
    if (parsed == null && error != undefined)
    {
      throw error;
    }
    else if (parsed != null)
    {
      //Remove first item which is the matched text, not the capturing group(s)
      parsed.shift();

      return Array.from(parsed);
    }
    else
    {
      return [];
    }
  }
};

/**
 * Extract text using a global regular expression safely
 * @param raw The raw string to execute the regex upon
 * @param regex The regex to execute
 * @param error An error to be thrown if there are no matches
 */
export const extractGlobal = (raw: string, regex: RegExp, error: Error | undefined = undefined): string[][] =>
{
  //Make sure the regex is global
  if (!regex.flags.includes('g'))
  {
    throw new Error('[Regex Utility] The passed regular expression is not global! (Try "extractLocal" instead)');
  }
  else
  {
    //Parse
    const parsed = Array.from(raw.matchAll(regex) || []);

    //Handle errors
    if (parsed.length == 0 && error != undefined)
    {
      throw error;
    }
    else if (parsed.length > 0)
    {
      const final: string[][] = [];

      //Remove first item which is the matched text, not the capturing group(s)
      parsed.forEach(match =>
      {
        final.push(match.slice(1));
      });

      return final;
    }
    else
    {
      return [[]];
    }
  }
};