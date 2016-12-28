import { expect } from 'chai';
import ArgumentParser from '../../src/parsers/ArgumentParser';
import ArgumentParserError from '../../src/errors/ArgumentParserError';
import ParameterParser from '../../src/parsers/ParameterParser';
import { TYPES } from '../../src/parsers/Constants';

describe('ArgumentParser', function() {
  describe('#parse()', function() {
    it('parses basic arguments', function() {
      const rules = ParameterParser.parse('pool', 'hello', 'poor=house');

      expect(ArgumentParser.parse(rules, 'bored boo')).to.deep.equal({
        pool: 'bored',
        hello: 'boo',
        poor: 'house',
      });
    });

    it('parses single arguments', function() {
      const rules = ParameterParser.parse(
        '(num) foo',
        'bar',
        '-baz',
        '(int) qux = 123',
      );

      expect(ArgumentParser.parse(rules, '-0 "mark my words"')).to.deep.equal({
        foo: -0,
        bar: 'mark my words',
        baz: null,
        qux: 123,
      });

      expect(ArgumentParser.parse(rules, '-123.533 "mark my words" "incorrect"')).to.deep.equal({
        foo: -123.533,
        bar: 'mark my words',
        baz: 'incorrect',
        qux: 123,
      });
    });

    it('parses repeatable arguments', function() {
      let rules = ParameterParser.parse('foo', 'bar*');

      expect(ArgumentParser.parse(rules, 'foo bar baz qux')).to.deep.equal({
        foo: 'foo',
        bar: ['bar', 'baz', 'qux'],
      });

      rules = ParameterParser.parse('foo', '-bar*');

      expect(ArgumentParser.parse(rules, 'foo')).to.deep.equal({
        foo: 'foo',
        bar: [],
      });

      rules = ParameterParser.parse('foo', 'bar = true', '-baz*');

      expect(ArgumentParser.parse(rules, 'foo bar bazzy')).to.deep.equal({
        foo: 'foo',
        bar: 'bar',
        baz: ['bazzy'],
      });
    });

    it('parses default arguments', function() {
      const rules = ParameterParser.parse(
        'foo = 123',
        '(bool) bar = false',
        '(int) baz* = 0 1 2 3',
      );

      expect(ArgumentParser.parse(rules, '')).to.deep.equal({
        foo: '123',
        bar: false,
        baz: [0, 1, 2, 3],
      });

      expect(ArgumentParser.parse(rules, 'treble')).to.deep.equal({
        foo: 'treble',
        bar: false,
        baz: [0, 1, 2, 3],
      });

      expect(ArgumentParser.parse(rules, '"treble trouble" false 0')).to.deep.equal({
        foo: 'treble trouble',
        bar: false,
        baz: [0],
      });
    });

    it('parses literal arguments', function() {
      let rules = ParameterParser.parse('+(str) literal+');

      expect(ArgumentParser.parse(rules, 'hello familia\'s reggi"o parmesian`no     ;;;')).to.deep.equal({
        literal: 'hello familia\'s reggi"o parmesian`no     ;;;',
      });
    });

    it('disallows missing required arguments', function() {
      let rules = ParameterParser.parse('foo', 'bar');

      expect(() => ArgumentParser.parse(rules, 'foo')).to.throw(
        ArgumentParserError,
        'required argument: \'bar\'.',
      );

      expect(() => ArgumentParser.parse(rules, 'foo bar')).to.not.throw(ArgumentParserError);

      rules = ParameterParser.parse('foo', 'bar*');

      expect(() => ArgumentParser.parse(rules, 'foo')).to.throw(
        ArgumentParserError,
        'required argument: \'bar\'.',
      );
    });

    it('disallows invalid argument types', function() {
      let rules = ParameterParser.parse('(int) foo');

      expect(() => ArgumentParser.parse(rules, 'hello')).to.throw(
        ArgumentParserError,
        'Expected argument \'hello\' to be of type \'INTEGER\'.',
      );

      rules = ParameterParser.parse('(bool) foo*');

      expect(() => ArgumentParser.parse(rules, 'true false t')).to.throw(
        ArgumentParserError,
        'Expected argument \'t\' to be of type \'BOOLEAN\'.',
      );

      expect(() => ArgumentParser.parse(rules, 'false false true')).to.not.throw(ArgumentParserError);
    });
  });

  describe('#normalizeArgumentType()', function() {
    it('does nothing to string arguments', function() {
      expect(ArgumentParser.normalizeArgumentType(TYPES.STRING, 'hallelujah')).to.equal('hallelujah');
    });

    it('converts boolean, number and integer argument types', function() {
      expect(ArgumentParser.normalizeArgumentType(TYPES.BOOLEAN, 'true')).to.be.true;
      expect(ArgumentParser.normalizeArgumentType(TYPES.BOOLEAN, 'false')).to.be.false;

      expect(ArgumentParser.normalizeArgumentType(TYPES.INTEGER, '10')).to.equal(10);
      expect(ArgumentParser.normalizeArgumentType(TYPES.INTEGER, '10.5')).to.equal(10);
      expect(ArgumentParser.normalizeArgumentType(TYPES.INTEGER, '-10')).to.equal(-10);
      expect(ArgumentParser.normalizeArgumentType(TYPES.INTEGER, '-10.5')).to.equal(-10);

      expect(ArgumentParser.normalizeArgumentType(TYPES.NUMBER, '123.4')).to.equal(123.4);
      expect(ArgumentParser.normalizeArgumentType(TYPES.NUMBER, '0')).to.equal(0);
      expect(ArgumentParser.normalizeArgumentType(TYPES.NUMBER, '+0')).to.equal(+0);
      expect(ArgumentParser.normalizeArgumentType(TYPES.NUMBER, '-0')).to.equal(-0);
      expect(ArgumentParser.normalizeArgumentType(TYPES.NUMBER, '-10')).to.equal(-10);
    });

    it('disallows invalid argument types', function() {
      expect(() => ArgumentParser.normalizeArgumentType(TYPES.BOOLEAN, 'h')).to.throw(
        ArgumentParserError,
        'Expected argument \'h\' to be of type \'BOOLEAN\'.',
      );

      expect(() => ArgumentParser.normalizeArgumentType(TYPES.NUMBER, 'h')).to.throw(
        ArgumentParserError,
        'Expected argument \'h\' to be of type \'NUMBER\'.',
      );

      expect(() => ArgumentParser.normalizeArgumentType(TYPES.INTEGER, 'NaN')).to.throw(
        ArgumentParserError,
        'Expected argument \'NaN\' to be of type \'INTEGER\'.',
      );
    });
  });
});
