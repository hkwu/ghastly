import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
import stringArgv from 'string-argv';
import ArgumentParser from '../../../src/Commands/Parsers/ArgumentParser';
import ArgumentParserError from '../../../src/Errors/ArgumentParserError';
import SignatureParser from '../../../src/Commands/Parsers/SignatureParser';
import CommandParserError from '../../../src/Errors/CommandParserError';

describe('ArgumentParser', function() {
  describe('#parse()', function() {
    it('parses basic arguments', function() {
      const rules = SignatureParser.parse('!hello [pool] [hello] [poor=house]').parameters;
      expect(ArgumentParser.parse(rules, stringArgv('bored boo'))).to.deep.equal({
        pool: 'bored',
        hello: 'boo',
        poor: 'house',
      });
    });

    it.only('parses variadic arguments', function() {
      let rules = SignatureParser.parse('!cmd [foo] [bar*]').parameters;
      expect(ArgumentParser.parse(rules, stringArgv('foo bar baz qux'))).to.deep.equal({
        foo: 'foo',
        bar: ['bar', 'baz', 'qux'],
      });

      rules = SignatureParser.parse('!cmd [foo] [bar*?]').parameters;
      expect(ArgumentParser.parse(rules, stringArgv('foo'))).to.deep.equal({
        foo: 'foo',
        bar: [],
      });

      rules = SignatureParser.parse('!cmd [foo] [bar=true] [baz*?]').parameters;
      expect(ArgumentParser.parse(rules, stringArgv('foo bar bazzy'))).to.deep.equal({
        foo: 'foo',
        bar: 'bar',
        baz: ['bazzy'],
      });
    });
  });
});
