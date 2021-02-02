import { expect } from 'chai';
import { describe, it } from 'mocha';

import { interpolate } from '../../../src/util/string';

describe('UTIL: string', () => {
  describe('interpolate', () => {
    it('should replace the template placeholders with params.', () => {
      expect(
        interpolate('<div class="{{className}}">{{text}}</div>', {
          className: 'test',
          text: 'Hello World!'
        })
      ).to.equal('<div class="test">Hello World!</div>');
    });

    it('should leave the unresolved placeholders as-is.', () => {
      expect(
        interpolate('Hello {{user}}! This is {{foo}}.', {
          user: 'Kabir'
        })
      ).to.equal('Hello Kabir! This is {{foo}}.');
    });
  });
});
