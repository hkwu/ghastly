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
        identifier: '!cmd',
        arguments: ['pro'],
        mentioned: false,
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
        identifier: '!cmd',
        arguments: [],
        mentioned: false,
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
        identifier: '!cmd',
        arguments: ['pro', 'pro'],
        mentioned: true,
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
        identifier: '<@123456789>',
        arguments: ['!cmd', 'pro', 'pro'],
        mentioned: false,
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
        identifier: '!cmd',
        arguments: ['pro', '<@123456789>', 'pro'],
        mentioned: false,
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

      expect(CommandParser.parse(message)).to.equal(false);
    });
  });
});
