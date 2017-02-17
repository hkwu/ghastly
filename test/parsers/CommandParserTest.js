import { expect } from 'chai';
import CommandParser from '../../src/parsers/CommandParser';

describe('CommandParser', function() {
  describe('#parse()', function() {
    it('parses basic commands', function() {
      let message = {
        content: '!cmd pro',
        client: {
          user: {
            id: '123456789',
          },
        },
      };

      expect(CommandParser.parse(message)).to.deep.equal({
        raw: '!cmd pro',
        trimmed: '!cmd pro',
        identifier: '!cmd',
        args: ['pro'],
      });

      message = {
        content: '!cmd',
        client: {
          user: {
            id: '123456789',
          },
        },
      };

      expect(CommandParser.parse(message)).to.deep.equal({
        raw: '!cmd',
        trimmed: '!cmd',
        identifier: '!cmd',
        args: [],
      });
    });

    it('parses commands with mentions', function() {
      let message = {
        content: '<@123456789> !cmd pro pro',
        client: {
          user: {
            id: '123456789',
          },
        },
      };

      expect(CommandParser.parse(message)).to.deep.equal({
        raw: '<@123456789> !cmd pro pro',
        trimmed: '!cmd pro pro',
        identifier: '!cmd',
        args: ['pro', 'pro'],
      });

      message = {
        content: '<@123456789> !cmd pro pro',
        client: {
          user: {
            id: '0',
          },
        },
      };

      expect(CommandParser.parse(message)).to.deep.equal({
        raw: '<@123456789> !cmd pro pro',
        trimmed: '<@123456789> !cmd pro pro',
        identifier: '<@123456789>',
        args: ['!cmd', 'pro', 'pro'],
      });

      message = {
        content: '!cmd pro <@123456789> pro',
        client: {
          user: {
            id: '123456789',
          },
        },
      };

      expect(CommandParser.parse(message)).to.deep.equal({
        raw: '!cmd pro <@123456789> pro',
        trimmed: '!cmd pro <@123456789> pro',
        identifier: '!cmd',
        args: ['pro', '<@123456789>', 'pro'],
      });
    });

    it('disallows mentions with no commands', function() {
      const message = {
        content: '<@123456789>',
        client: {
          user: {
            id: '123456789',
          },
        },
      };

      expect(() => CommandParser.parse(message)).to.throw(Error);
    });
  });
});
