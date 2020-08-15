/**
 * @fileoverview Metadata Utility
 */

//Imports
import {expect} from 'chai';
import {extractMetadata} from './metadata';

describe('metadata utility', () =>
{
  it('will extract top-level metadata', () =>
  {
    const metadata = extractMetadata({
      //Invalid name
      'not-metadata': {
        '@_name': 'test-name',
        'type': 'text',
        '#text': 'test-text'
      },
      'metadata': [
        //Invalid attributes
        {
          type: 'text',
          text: 'test-text'
        },
        //Invalid child elements
        {
          '@_name': 'test-name'
        },
        //Valid (Name attribute)
        {
          '@_name': 'test-name',
          'type': 'text',
          '#text': 'test-text-name'
        },
        //Valid (Type attribute)
        {
          '@_type': 'test-type',
          'type': 'text',
          '#text': 'test-text-type'
        }
      ]
    });

    expect(metadata).to.eql({
      'test-name': 'test-text-name',
      'test-type': 'test-text-type'
    });
  });

  it('will extract second-level metadata', () =>
  {
    const metadata = extractMetadata({
      'top-level-element-1': {
        //Invalid name
        'not-metadata': {
          '@_name': 'test-name',
          'type': 'text',
          '#text': 'test-text'
        },
        'metadata': [
          //Invalid attributes
          {
            type: 'text',
            text: 'test-text'
          },
          //Valid (Name attribute)
          {
            '@_name': 'test-name',
            'type': 'text',
            '#text': 'test-text-name'
          }
        ],
      },
      'top-level-element-2': {
        metadata: [
          //Invalid child elements
          {
            '@_name': 'test-name'
          },
          //Valid (Type attribute)
          {
            '@_type': 'test-type',
            'type': 'text',
            '#text': 'test-text-type'
          }
        ]
      }
    });

    expect(metadata).to.eql({
      'top-level-element-1': {
        'test-name': 'test-text-name'
      },
      'top-level-element-2': {
        'test-type': 'test-text-type'
      }
    });
  });
});