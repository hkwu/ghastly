import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
import ParameterParser from '../../src/parsers/ParameterParser';
import ParameterParserError from '../../src/errors/ParameterParserError';
import * as Types from '../../src/parsers/Types';

describe('ParameterParser', function() {
  before(function() {
    chai.use(chaiSubset);
  });

  describe('#parse()', function() {
    it('allows repeatable parameters only as the last parameter', function() {
      expect(() => ParameterParser.parse('paramName', 'paramName2*')).to.not.throw(ParameterParserError);
      expect(() => ParameterParser.parse('paramName*', 'paramName2')).to.throw(ParameterParserError, 'must be the last parameter');
    });

    it('allows literal parameters as the only parameter', function() {
      expect(() => ParameterParser.parse('+(str) literal+ : This is a literal')).to.not.throw(ParameterParserError);
      expect(() => ParameterParser.parse('+(str) literal+ : This is a literal', 'notallowed')).to.throw(ParameterParserError, 'must be the only parameter');
      expect(() => ParameterParser.parse('notallowed', '+(str) literal+ : This is a literal')).to.throw(ParameterParserError, 'must be the only parameter');
    });

    it('disallows required parameters after optional parameters', function() {
      expect(() => ParameterParser.parse('+ required', '- optional')).to.not.throw(ParameterParserError);
      expect(() => ParameterParser.parse('- optional', '+ required')).to.throw(ParameterParserError, 'Cannot have required parameters after optional');
      expect(() => ParameterParser.parse('- optional', 'required')).to.throw(ParameterParserError, 'Cannot have required parameters after optional');
    });
  });

  describe('#parseParameter()', function() {
    it('parses basic parameters', function() {
      expect(ParameterParser.parseParameter('+foo')).to.deep.equal({
        name: 'foo',
        optional: false,
        description: null,
        type: Types.STRING,
        repeatable: false,
        literal: false,
        defaultValue: null,
      });

      expect(ParameterParser.parseParameter('-(num) param = 123.5 : some description')).to.deep.equal({
        name: 'param',
        optional: true,
        description: 'some description',
        type: Types.NUMBER,
        repeatable: false,
        literal: false,
        defaultValue: 123.5,
      });

      expect(ParameterParser.parseParameter('name:description')).to.deep.equal({
        name: 'name',
        optional: false,
        description: 'description',
        type: Types.STRING,
        repeatable: false,
        literal: false,
        defaultValue: null,
      });

      expect(ParameterParser.parseParameter('-argument:optional')).to.deep.equal({
        name: 'argument',
        optional: true,
        description: 'optional',
        type: Types.STRING,
        repeatable: false,
        literal: false,
        defaultValue: null,
      });

      expect(ParameterParser.parseParameter('array*:description')).to.deep.equal({
        name: 'array',
        optional: false,
        description: 'description',
        type: Types.STRING,
        repeatable: true,
        literal: false,
        defaultValue: [],
      });
    });

    it('parses descriptions', function() {
      expect(ParameterParser.parseParameter('name:description')).to.containSubset({
        name: 'name',
        description: 'description',
      });

      expect(ParameterParser.parseParameter('name*:description')).to.containSubset({
        name: 'name',
        description: 'description',
      });

      expect(ParameterParser.parseParameter('-name:description')).to.containSubset({
        name: 'name',
        description: 'description',
      });

      expect(ParameterParser.parseParameter('-name*:description')).to.containSubset({
        name: 'name',
        description: 'description',
      });

      expect(ParameterParser.parseParameter('name=default:description')).to.containSubset({
        name: 'name',
        description: 'description',
      });

      expect(ParameterParser.parseParameter('name*=default1 default2:description')).to.containSubset({
        name: 'name',
        description: 'description',
      });

      expect(ParameterParser.parseParameter('name*=default1 default2:description with a : colon')).to.containSubset({
        name: 'name',
        description: 'description with a : colon',
      });
    });

    it('strips whitespace in parameter definitions', function() {
      expect(ParameterParser.parseParameter('    -   (   str   )   white  *    =   space   :   man  the    ')).to.deep.equal({
        name: 'white',
        optional: true,
        description: 'man  the',
        type: Types.STRING,
        repeatable: true,
        literal: false,
        defaultValue: ['space'],
      });
    });

    it('disallows empty parameters', function() {
      expect(() => ParameterParser.parseParameter('')).to.throw(ParameterParserError, 'Parameter cannot be empty');
    });
  });

  describe('#parseDefinition()', function() {
    it('parses basic arguments', function() {
      expect(ParameterParser.parseDefinition('basic')).to.deep.equal({
        name: 'basic',
        type: Types.STRING,
        optional: false,
        repeatable: false,
        literal: false,
      });
    });

    it('parses repeatable arguments', function() {
      expect(ParameterParser.parseDefinition('array*')).to.containSubset({
        name: 'array',
        optional: false,
        repeatable: true,
      });
    });

    it('parses optional arguments', function() {
      expect(ParameterParser.parseDefinition('-optional')).to.containSubset({
        name: 'optional',
        optional: true,
        repeatable: false,
      });
    });

    it('parses optional repeatable arguments', function() {
      expect(ParameterParser.parseDefinition('-array*')).to.containSubset({
        name: 'array',
        optional: true,
        repeatable: true,
        defaultValue: [],
      });
    });

    it('parses default single arguments', function() {
      expect(ParameterParser.parseDefinition('single=true')).to.containSubset({
        name: 'single',
        defaultValue: 'true',
      });
    });

    it('parses default repeatable arguments', function() {
      expect(ParameterParser.parseDefinition('array*=one two three four')).to.containSubset({
        name: 'array',
        optional: true,
        repeatable: true,
        defaultValue: ['one', 'two', 'three', 'four'],
      });
    });

    it('parses default repeatable values with spaces', function() {
      expect(ParameterParser.parseDefinition('array*=\'single quotes\' "double quotes" \'nested "quotes"\'')).to.containSubset({
        name: 'array',
        defaultValue: ['single quotes', 'double quotes', 'nested "quotes"'],
      });
    });

    it('parses parameter types', function() {
      expect(ParameterParser.parseDefinition('(bool)variable')).to.containSubset({
        name: 'variable',
        type: Types.BOOLEAN,
      });

      expect(ParameterParser.parseDefinition('(boolean)variable')).to.containSubset({
        name: 'variable',
        type: Types.BOOLEAN,
      });

      expect(ParameterParser.parseDefinition('(integer)variable')).to.containSubset({
        name: 'variable',
        type: Types.INTEGER,
      });

      expect(ParameterParser.parseDefinition('(int)variable')).to.containSubset({
        name: 'variable',
        type: Types.INTEGER,
      });

      expect(ParameterParser.parseDefinition('(number)variable')).to.containSubset({
        name: 'variable',
        type: Types.NUMBER,
      });

      expect(ParameterParser.parseDefinition('(num)variable')).to.containSubset({
        name: 'variable',
        type: Types.NUMBER,
      });

      expect(ParameterParser.parseDefinition('(string)variable')).to.containSubset({
        name: 'variable',
        type: Types.STRING,
      });

      expect(ParameterParser.parseDefinition('(str)variable')).to.containSubset({
        name: 'variable',
        type: Types.STRING,
      });

      expect(ParameterParser.parseDefinition('(num)variable*')).to.containSubset({
        name: 'variable',
        type: Types.NUMBER,
        repeatable: true,
      });
    });

    it('parses typed default values', function() {
      expect(ParameterParser.parseDefinition('(bool)name=true')).to.containSubset({
        name: 'name',
        type: Types.BOOLEAN,
        defaultValue: true,
      });

      expect(ParameterParser.parseDefinition('(bool)name=false')).to.containSubset({
        name: 'name',
        type: Types.BOOLEAN,
        defaultValue: false,
      });

      expect(ParameterParser.parseDefinition('(int)name=123')).to.containSubset({
        name: 'name',
        type: Types.INTEGER,
        defaultValue: 123,
      });

      expect(ParameterParser.parseDefinition('(int)name=123.555')).to.containSubset({
        name: 'name',
        type: Types.INTEGER,
        defaultValue: 123,
      });

      expect(ParameterParser.parseDefinition('(num)name=123.555')).to.containSubset({
        name: 'name',
        type: Types.NUMBER,
        defaultValue: 123.555,
      });

      expect(ParameterParser.parseDefinition('(str)name=false')).to.containSubset({
        name: 'name',
        type: Types.STRING,
        defaultValue: 'false',
      });

      expect(ParameterParser.parseDefinition('(bool)name*=true false "true" false')).to.containSubset({
        name: 'name',
        type: Types.BOOLEAN,
        defaultValue: [true, false, true, false],
      });

      expect(ParameterParser.parseDefinition('(number)name*=123 -233 -100.5 0 23.4')).to.containSubset({
        name: 'name',
        type: Types.NUMBER,
        defaultValue: [123, -233, -100.5, 0, 23.4],
      });
    });

    it('strips redundant pluses and minuses', function() {
      expect(ParameterParser.parseDefinition('+single')).to.containSubset({
        name: 'single',
        optional: false,
      });

      expect(ParameterParser.parseDefinition('++++++++single')).to.containSubset({
        name: 'single',
        optional: false,
      });

      expect(ParameterParser.parseDefinition('-single=true')).to.containSubset({
        name: 'single',
        optional: true,
        repeatable: false,
        defaultValue: 'true',
      });

      expect(ParameterParser.parseDefinition('-----------array*=one two')).to.containSubset({
        name: 'array',
        optional: true,
        repeatable: true,
        defaultValue: ['one', 'two'],
      });
    });

    it('strips redundant asterisks', function() {
      expect(ParameterParser.parseDefinition('array********')).to.containSubset({
        name: 'array',
        repeatable: true,
      });

      expect(ParameterParser.parseDefinition('-array****')).to.containSubset({
        name: 'array',
        optional: true,
        repeatable: true,
      });
    });

    it('strips whitespace', function() {
      expect(ParameterParser.parseDefinition('name   =   someVal')).to.containSubset({
        name: 'name',
        optional: true,
        defaultValue: 'someVal',
      });

      expect(ParameterParser.parseDefinition('- array   *   = someVal')).to.containSubset({
        name: 'array',
        optional: true,
        repeatable: true,
        defaultValue: ['someVal'],
      });
    });

    it('disallows invalid parameter types', function() {
      expect(() => (
        ParameterParser.parseDefinition('(func) name')
      )).to.throw(ParameterParserError, 'Unrecognized parameter type declaration');

      expect(() => (
        ParameterParser.parseDefinition('-(NUMB) name')
      )).to.throw(ParameterParserError, 'Unrecognized parameter type declaration');
    });

    it('disallows invalid default value types', function() {
      expect(() => (
        ParameterParser.parseDefinition('(int) array* = hey not an integer 123 !')
      )).to.throw(ParameterParserError, 'Given default value \'hey\' is not of the correct type');

      expect(() => (
        ParameterParser.parseDefinition('(bool) single = default')
      )).to.throw(ParameterParserError, 'Given default value \'default\' is not of the correct type');

      expect(() => (
        ParameterParser.parseDefinition('(bool) single = true')
      )).to.not.throw(ParameterParserError, 'Given default value \'true\' is not of the correct type');
    });

    it('disallows non-string literal parameters', function() {
      expect(() => ParameterParser.parseDefinition('(int) literal+')).to.throw(ParameterParserError, 'Literals can only be used with string parameters');
      expect(() => ParameterParser.parseDefinition('(str) literal+')).to.not.throw(ParameterParserError);
      expect(() => ParameterParser.parseDefinition('(string) literal+')).to.not.throw(ParameterParserError);
    });
  });
});
