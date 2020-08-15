/**
 * @fileoverview PLY Parser Utilities
 */

//Imports
import {extractLocal, extractGlobal} from '../../utils/regex';

//Patterns
const patterns = {
  element: /element (\w+) (\d+)([\s\S]+?)(?=element|end_header)/g,
  format: /format\s+(\w+)/,
  header: /(ply[\s\S]+end_header)/,
  property: /temporary/g,
  listProperty: /temporary/g,
  type: /(u?(?:char|short|int)|float|double)/
};

patterns.property = new RegExp(`property ${patterns.type.source} (\\w+)`, 'g');
patterns.listProperty = new RegExp(`property list ${patterns.type.source} ${patterns.type.source} (\\w+)`, 'g');


/**
 * Types of PLY files
 * 
 * * `ascii`: Plain text PLY format
 * * `binary-be`: Big-Endian Binary PLY format
 * * `binary-le`: Little-Endian Binary PLY format
 */
export type PlyFormats = 'ascii' | 'binary-be' | 'binary-le';

/**
 * Categorize a file
 * @param file The file to categorize
 */
export const categorizeFile = (file: string): PlyFormats =>
{
  //Extract header
  const [header] = extractLocal(file, patterns.header, new Error('Failed to extract PLY header while categorizing the file!'));

  //Extract format from header
  const [typeString] = extractLocal(header, patterns.format, new Error('Failed to detect PLY type!'));

  switch (typeString)
  {
    case 'ascii': {
      return 'ascii';
    }

    case 'binary_big_endian': {
      return 'binary-be';
    }

    case 'binary_little_endian': {
      return 'binary-le';
    }

    default: {
      throw new Error(`Invalid PLY format: ${typeString}`);
    }
  }
};

/**
 * A PLY header numeric type
 */
interface NumericType
{
  /**
   * The size of the type (In bytes)
   */
  size: number,

  /**
   * The symbol/string representation of the type
   */
  symbol: string,

  /**
   * DataView manipulation methods
   */
  dataView: {
    /**
     * Method used to get the type from a `DataView`
     */
    get: (offset: number, littleEndian: boolean) => number,

    /**
     * Method used to set the type in a `DataView`
     */
    set: (offset: number, value: number) => undefined
  }
}

/**
 * PLY header numeric types
 */
export const NumericTypes: {
  CHAR: NumericType,
  UCHAR: NumericType,
  SHORT: NumericType,
  USHORT: NumericType,
  INT: NumericType,
  UINT: NumericType,
  FLOAT: NumericType,
  DOUBLE: NumericType
} = {
  /**
   * 1-byte signed integer
   */
  CHAR: {
    size: 1,
    symbol: 'char',
    dataView: {
      get: DataView.prototype.getInt8,
      set: DataView.prototype.setInt8
    }
  },

  /**
   * 1-byte unsigned integer
   */
  UCHAR: {
    size: 1,
    symbol: 'uchar',
    dataView: {
      get: DataView.prototype.getUint8,
      set: DataView.prototype.setUint8
    }
  },

  /**
   * 2-byte signed integer
   */
  SHORT: {
    size: 2,
    symbol: 'short',
    dataView: {
      get: DataView.prototype.getInt16,
      set: DataView.prototype.setInt16
    }
  },

  /**
   * 2-byte unsigned integer
   */
  USHORT: {
    size: 2,
    symbol: 'ushort',
    dataView: {
      get: DataView.prototype.getUint16,
      set: DataView.prototype.setUint16
    }
  },

  /**
   * 4-byte signed integer
   */
  INT: {
    size: 4,
    symbol: 'int',
    dataView: {
      get: DataView.prototype.getInt32,
      set: DataView.prototype.setInt32
    }
  },

  /**
   * 4-byte unsigned integer
   */
  UINT: {
    size: 4,
    symbol: 'uint',
    dataView: {
      get: DataView.prototype.getUint32,
      set: DataView.prototype.setUint32
    }
  },

  /**
   * 4-byte single-precision float
   */
  FLOAT: {
    size: 4,
    symbol: 'float',
    dataView: {
      get: DataView.prototype.getFloat32,
      set: DataView.prototype.setFloat32
    }
  },

  /**
   * 8-byte, double-precision float
   */
  DOUBLE: {
    size: 8,
    symbol: 'double',
    dataView: {
      get: DataView.prototype.getFloat64,
      set: DataView.prototype.setFloat64
    }
  }
};

//Cache the `NumericTypes` symbols for type-checking later on
const numericTypeSymbols = Object.values(NumericTypes).map(numericType => numericType.symbol);

/**
 * PLY header element property
 */
interface Property
{
  /**
   * Name of the property
   */
  name: string,

  /**
   * Wether the property is a list
   * 
   * If true, the `countType` should be the list's item-count type,
   * otherwise the `countType` will be undefined
   */
  list: boolean,

  /**
   * The property type
   */
  type: NumericType,

  /**
   * The list's item-count type
   */
  countType: NumericType
}

/**
 * PLY header element
 */
interface Element
{
  /**
   * The name of the element
   */
  name: string,

  /**
   * The number of elements in the body
   */
  count: number,

  /**
   * The element offset within the body
   */
  offset: number,

  /**
   * A list of element properties (Data attributes)
   */
  properties: Property[]
}

/**
 * Parse the elements in the PLY header
 * @param file The file to parse
 */
export const parseElements = (file: string): Element[] =>
{
  //Extract header
  const [header] = extractLocal(file, patterns.header, new Error('Failed to extract PLY header while extracting face and vertice information!'));

  //Extract all elements
  const elements = extractGlobal(header, patterns.element, new Error('Failed to extract PLY elements!'));

  const info = [];

  //Parse individual elements
  let offset = 0;
  for (const [name, rawCount, rawProperties] of elements)
  {
    const properties: Property[] = [];

    //Parse properties
    const singleProperties = extractGlobal(rawProperties, patterns.property);
    const listProperties = extractGlobal(rawProperties, patterns.listProperty);

    if (singleProperties.length > 0 && singleProperties[0].length > 0)
    {
      for (const [typeSymbol, name] of singleProperties)
      {
        if (!numericTypeSymbols.includes(typeSymbol))
        {
          throw new Error(`Unknown PLY header numeric type: "${typeSymbol}"`);
        }

        //Get the current type (As a `NumericType`)
        const type = Object.values(NumericTypes).find(numericType => numericType.symbol == typeSymbol);

        properties.push({
          list: false,
          name,
          //@ts-ignore We already performed strict type checking
          type
        });
      }
    }

    if (listProperties.length > 0 && listProperties[0].length > 0)
    {
      for (const [countTypeSymbol, typeSymbol, name] of listProperties)
      {
        if (!numericTypeSymbols.includes(countTypeSymbol))
        {
          throw new Error(`Unknown PLY header numeric type: "${countTypeSymbol}"`);
        }

        if (!numericTypeSymbols.includes(typeSymbol))
        {
          throw new Error(`Unknown PLY header numeric type: "${typeSymbol}"`);
        }

        //Get the current type (As a `NumericType`)
        const type = Object.values(NumericTypes).find(numericType => numericType.symbol == typeSymbol);

        //Get the current count type (As a `NumericType`)
        const countType = Object.values(NumericTypes).find(numericType => numericType.symbol == countTypeSymbol);

        properties.push({
          //@ts-ignore We already performed strict type checking
          countType,
          list: true,
          name,
          //@ts-ignore We already performed strict type checking
          type
        });
      }
    }

    //Parse the count to a string
    const count = parseInt(rawCount);

    info.push({
      count,
      name,
      offset,
      properties
    });

    //Increment offset
    offset += count;
  }

  return info;
};