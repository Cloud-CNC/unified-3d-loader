/**
 * @fileoverview Regular Expression Utilities Unit Tests
 */

//Imports
import {expect} from 'chai';
import {extractLocal, extractGlobal} from './regex';

describe('regex utilities', () =>
{
  it('will extract text using a global regular expression', () =>
  {
    const error = new Error('Dummy Error');

    const result = extractGlobal('_hello_hello_hello', /_(hel)(lo)/g, error);
    expect(result).to.be.an('array');
    expect(result).to.have.length(3);
    expect(result[0]).to.have.length(2);
    expect(result[1]).to.have.length(2);
    expect(result[2]).to.have.length(2);

    expect(result).to.eql([
      ['hel', 'lo'],
      ['hel', 'lo'],
      ['hel', 'lo']
    ]);

    try
    {
      extractGlobal('hellohellohello', /wontmatch/g, error);

      throw new Error('Shouldn\'t get this far!');
    }
    catch (err)
    {
      expect(err.message).to.equal(error.message);
    }
  });

  it('will extract text using a local regular expression', () =>
  {
    const error = new Error('Dummy Error');

    const result = extractLocal('_hello_hello_hello', /_(hel)(lo)/, error);
    expect(result).to.be.a('array');
    expect(result).to.have.length(2);
    expect(result).to.eql(['hel', 'lo']);

    try
    {
      extractLocal('hellohellohello', /wontmatch/, error);
    }
    catch (err)
    {
      expect(err.message).to.equal(error.message);
    }
  });
});