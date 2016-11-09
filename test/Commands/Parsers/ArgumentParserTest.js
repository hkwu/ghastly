import { expect } from 'chai';
import stringArgv from 'string-argv';
import ArgumentParser from '../../../src/Commands/Parsers/ArgumentParser';
import ArgumentParserError from '../../../src/Errors/ArgumentParserError';
import SignatureParser from '../../../src/Commands/Parsers/SignatureParser';
import { TOKEN } from '../../../src/Parsers/Constants';

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

    it('parses single arguments', function() {
      const rules = SignatureParser.parse('!cmd [foo<num>] [bar] [baz?] [qux<int>=123]').parameters;
      expect(ArgumentParser.parse(rules, stringArgv('-0 "mark my words"'))).to.deep.equal({
        foo: -0,
        bar: 'mark my words',
        baz: null,
        qux: 123,
      });

      expect(ArgumentParser.parse(rules, stringArgv('-123.533 "mark my words" "incorrect"'))).to.deep.equal({
        foo: -123.533,
        bar: 'mark my words',
        baz: 'incorrect',
        qux: 123,
      });
    });

    it('parses variable length arguments', function() {
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

    it('parses default arguments', function() {
      const rules = SignatureParser.parse('!cmd [foo=123] [bar<bool>=false] [baz<int*>=0 1 2 3]').parameters;
      expect(ArgumentParser.parse(rules, stringArgv(''))).to.deep.equal({
        foo: '123',
        bar: false,
        baz: [0, 1, 2, 3],
      });

      expect(ArgumentParser.parse(rules, stringArgv('treble'))).to.deep.equal({
        foo: 'treble',
        bar: false,
        baz: [0, 1, 2, 3],
      });

      expect(ArgumentParser.parse(rules, stringArgv('"treble trouble" false 0'))).to.deep.equal({
        foo: 'treble trouble',
        bar: false,
        baz: [0],
      });
    });

    it('disallows missing required arguments', function() {
      let rules = SignatureParser.parse('!cmd [foo] [bar]').parameters;
      expect(() => ArgumentParser.parse(rules, stringArgv('foo'))).to.throw(
        ArgumentParserError,
        'required argument: <bar>.',
      );

      expect(() => ArgumentParser.parse(rules, stringArgv('foo bar'))).to.not.throw(ArgumentParserError);

      rules = SignatureParser.parse('!cmd [foo] [bar*]').parameters;
      expect(() => ArgumentParser.parse(rules, stringArgv('foo'))).to.throw(
        ArgumentParserError,
        'required argument: <bar>.',
      );
    });

    it('disallows invalid argument types', function() {
      let rules = SignatureParser.parse('!cmd [foo<int>]').parameters;
      expect(() => ArgumentParser.parse(rules, stringArgv('hello'))).to.throw(
        ArgumentParserError,
        'Expected argument <hello> to be of type <INTEGER>.',
      );

      rules = SignatureParser.parse('!cmd [foo<bool*>]').parameters;
      expect(() => ArgumentParser.parse(rules, stringArgv('true false t'))).to.throw(
        ArgumentParserError,
        'Expected argument <t> to be of type <BOOLEAN>.',
      );

      expect(() => ArgumentParser.parse(rules, stringArgv('false false true'))).to.not.throw(ArgumentParserError);
    });
  });

  describe('#normalizeArgumentType()', function() {
    it('does nothing to string arguments', function() {
      expect(ArgumentParser.normalizeArgumentType(TOKEN.TYPE.STRING, 'hallelujah')).to.equal('hallelujah');
    });

    it('converts boolean, number and integer argument types', function() {
      expect(ArgumentParser.normalizeArgumentType(TOKEN.TYPE.BOOLEAN, 'true')).to.be.true;
      expect(ArgumentParser.normalizeArgumentType(TOKEN.TYPE.BOOLEAN, 'false')).to.be.false;

      expect(ArgumentParser.normalizeArgumentType(TOKEN.TYPE.INTEGER, '10')).to.equal(10);
      expect(ArgumentParser.normalizeArgumentType(TOKEN.TYPE.INTEGER, '10.5')).to.equal(10);
      expect(ArgumentParser.normalizeArgumentType(TOKEN.TYPE.INTEGER, '-10')).to.equal(-10);
      expect(ArgumentParser.normalizeArgumentType(TOKEN.TYPE.INTEGER, '-10.5')).to.equal(-10);

      expect(ArgumentParser.normalizeArgumentType(TOKEN.TYPE.NUMBER, '123.4')).to.equal(123.4);
      expect(ArgumentParser.normalizeArgumentType(TOKEN.TYPE.NUMBER, '0')).to.equal(0);
      expect(ArgumentParser.normalizeArgumentType(TOKEN.TYPE.NUMBER, '+0')).to.equal(+0);
      expect(ArgumentParser.normalizeArgumentType(TOKEN.TYPE.NUMBER, '-0')).to.equal(-0);
      expect(ArgumentParser.normalizeArgumentType(TOKEN.TYPE.NUMBER, '-10')).to.equal(-10);
    });

    it('disallows invalid argument types', function() {
      expect(() => ArgumentParser.normalizeArgumentType(TOKEN.TYPE.BOOLEAN, 'h')).to.throw(
        ArgumentParserError,
        'Expected argument <h> to be of type <BOOLEAN>.',
      );

      expect(() => ArgumentParser.normalizeArgumentType(TOKEN.TYPE.NUMBER, 'h')).to.throw(
        ArgumentParserError,
        'Expected argument <h> to be of type <NUMBER>.',
      );

      expect(() => ArgumentParser.normalizeArgumentType(TOKEN.TYPE.INTEGER, 'NaN')).to.throw(
        ArgumentParserError,
        'Expected argument <NaN> to be of type <INTEGER>.',
      );
    });
  });
});
