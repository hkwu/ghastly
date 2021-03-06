import { expect } from 'chai';
import ArgumentParser from '../../src/command/parsers/ArgumentParser';
import ArgumentParserError from '../../src/errors/ArgumentParserError';
import ParameterParser from '../../src/command/parsers/ParameterParser';
import * as Types from '../../src/command/parsers/Types';

describe('ArgumentParser', function () {
  describe('#parse()', function () {
    it('parses basic arguments', function () {
      const rules = ParameterParser.validate('pool', 'hello', 'poor=house');

      expect(ArgumentParser.parse(rules, 'bored boo')).to.deep.equal({
        pool: 'bored',
        hello: 'boo',
        poor: 'house',
      });
    });

    it('parses single arguments', function () {
      const rules = ParameterParser.validate(
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

    it('parses repeatable arguments', function () {
      let rules = ParameterParser.validate('foo', 'bar*');

      expect(ArgumentParser.parse(rules, 'foo bar baz qux')).to.deep.equal({
        foo: 'foo',
        bar: ['bar', 'baz', 'qux'],
      });

      rules = ParameterParser.validate('foo', '-bar*');

      expect(ArgumentParser.parse(rules, 'foo')).to.deep.equal({
        foo: 'foo',
        bar: [],
      });

      rules = ParameterParser.validate('foo', 'bar = true', '-baz*');

      expect(ArgumentParser.parse(rules, 'foo bar bazzy')).to.deep.equal({
        foo: 'foo',
        bar: 'bar',
        baz: ['bazzy'],
      });
    });

    it('parses default arguments', function () {
      const rules = ParameterParser.validate(
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

    it('parses literal arguments', function () {
      const rules = ParameterParser.validate('+(str) literal...');

      expect(ArgumentParser.parse(rules, 'hello familia\'s reggi"o parmesian`no     ;;;')).to.deep.equal({
        literal: 'hello familia\'s reggi"o parmesian`no     ;;;',
      });
    });

    it('disallows missing required arguments', function () {
      let rules = ParameterParser.validate('foo', 'bar');

      expect(() => ArgumentParser.parse(rules, 'foo')).to.throw(
        ArgumentParserError,
        'required argument: \'bar\'.',
      );

      expect(() => ArgumentParser.parse(rules, 'foo bar')).to.not.throw(ArgumentParserError);

      rules = ParameterParser.validate('foo', 'bar*');

      expect(() => ArgumentParser.parse(rules, 'foo')).to.throw(
        ArgumentParserError,
        'required argument: \'bar\'.',
      );
    });

    it('disallows invalid argument types', function () {
      let rules = ParameterParser.validate('(int) foo');

      expect(() => ArgumentParser.parse(rules, 'hello')).to.throw(
        ArgumentParserError,
        'Expected argument \'hello\' to be of type \'integer\'.',
      );

      rules = ParameterParser.validate('(bool) foo*');

      expect(() => ArgumentParser.parse(rules, 'true false t')).to.throw(
        ArgumentParserError,
        'Expected argument \'t\' to be of type \'boolean\'.',
      );

      expect(() => ArgumentParser.parse(rules, 'false false true')).to.not.throw(ArgumentParserError);
    });
  });

  describe('#normalizeArgumentType()', function () {
    it('does nothing to string arguments', function () {
      expect(ArgumentParser.normalizeArgumentType(Types.STRING, 'hallelujah')).to.equal('hallelujah');
    });

    it('converts boolean, number and integer argument types', function () {
      expect(ArgumentParser.normalizeArgumentType(Types.BOOLEAN, 'true')).to.be.true;
      expect(ArgumentParser.normalizeArgumentType(Types.BOOLEAN, 'false')).to.be.false;

      expect(ArgumentParser.normalizeArgumentType(Types.INTEGER, '10')).to.equal(10);
      expect(ArgumentParser.normalizeArgumentType(Types.INTEGER, '10.5')).to.equal(10);
      expect(ArgumentParser.normalizeArgumentType(Types.INTEGER, '-10')).to.equal(-10);
      expect(ArgumentParser.normalizeArgumentType(Types.INTEGER, '-10.5')).to.equal(-10);

      expect(ArgumentParser.normalizeArgumentType(Types.NUMBER, '123.4')).to.equal(123.4);
      expect(ArgumentParser.normalizeArgumentType(Types.NUMBER, '0')).to.equal(0);
      expect(ArgumentParser.normalizeArgumentType(Types.NUMBER, '+0')).to.equal(+0);
      expect(ArgumentParser.normalizeArgumentType(Types.NUMBER, '-0')).to.equal(-0);
      expect(ArgumentParser.normalizeArgumentType(Types.NUMBER, '-10')).to.equal(-10);
    });

    it('disallows invalid argument types', function () {
      expect(() => ArgumentParser.normalizeArgumentType(Types.BOOLEAN, 'h')).to.throw(
        ArgumentParserError,
        'Expected argument \'h\' to be of type \'boolean\'.',
      );

      expect(() => ArgumentParser.normalizeArgumentType(Types.NUMBER, 'h')).to.throw(
        ArgumentParserError,
        'Expected argument \'h\' to be of type \'number\'.',
      );

      expect(() => ArgumentParser.normalizeArgumentType(Types.INTEGER, 'NaN')).to.throw(
        ArgumentParserError,
        'Expected argument \'NaN\' to be of type \'integer\'.',
      );
    });
  });
});
