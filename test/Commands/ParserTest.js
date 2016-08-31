import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
import Parser from '../../src/Commands/Parser';
import CommandParserError from '../../src/Errors/CommandParserError';

describe('Parser', function() {
  before(function() {
    chai.use(chaiSubset);
  });

  describe('#parse()', function() {
    it('parses basic signatures', function() {
      expect(Parser.parse('sample [command] [other] [foo]')).to.deep.equal({
        identifier: 'sample',
        parameters: [
          {
            name: 'command',
            description: null,
            arity: Parser.TOKEN.ARITY.UNARY,
            type: Parser.TOKEN.TYPE.STRING,
            optional: false,
            defaultValue: null,
          },
          {
            name: 'other',
            description: null,
            arity: Parser.TOKEN.ARITY.UNARY,
            type: Parser.TOKEN.TYPE.STRING,
            optional: false,
            defaultValue: null,
          },
          {
            name: 'foo',
            description: null,
            arity: Parser.TOKEN.ARITY.UNARY,
            type: Parser.TOKEN.TYPE.STRING,
            optional: false,
            defaultValue: null,
          },
        ],
      });
    });

    it('parses signatures without parameters', function() {
      expect(Parser.parse('noParams')).to.deep.equal({
        identifier: 'noParams',
      });
    });

    it('strips whitespace from command name and parameters', function() {
      expect(Parser.parse('   white      [space]   [two]    ')).to.deep.equal({
        identifier: 'white',
        parameters: [
          {
            name: 'space',
            description: null,
            arity: Parser.TOKEN.ARITY.UNARY,
            type: Parser.TOKEN.TYPE.STRING,
            optional: false,
            defaultValue: null,
          },
          {
            name: 'two',
            description: null,
            arity: Parser.TOKEN.ARITY.UNARY,
            type: Parser.TOKEN.TYPE.STRING,
            optional: false,
            defaultValue: null,
          },
        ],
      });
    });

    it('requires parameter values if text follows the command name', function() {
      expect(() => Parser.parse('name and some values that shouldn\'t be here')).to.throw(
        CommandParserError,
        'Expected parameter definitions after command name',
      );

      expect(() => Parser.parse('name and some values [with] [params]')).to.not.throw(
        CommandParserError,
        'Expected parameter definitions after command name',
      );
    });

    it('disallows empty signatures', function() {
      expect(() => Parser.parse('')).to.throw(CommandParserError, 'Signature cannot be empty');
    });
  });

  describe('#parseParameters()', function() {
    it('parses basic parameters', function() {
      expect(Parser.parseParameters([
        'name:description',
        'argument?:optional',
        'array*?:description',
      ])).to.deep.equal([
        {
          name: 'name',
          description: 'description',
          arity: Parser.TOKEN.ARITY.UNARY,
          type: Parser.TOKEN.TYPE.STRING,
          optional: false,
          defaultValue: null,
        },
        {
          name: 'argument',
          description: 'optional',
          arity: Parser.TOKEN.ARITY.UNARY,
          type: Parser.TOKEN.TYPE.STRING,
          optional: true,
          defaultValue: null,
        },
        {
          name: 'array',
          description: 'description',
          arity: Parser.TOKEN.ARITY.VARIADIC,
          type: Parser.TOKEN.TYPE.STRING,
          optional: true,
          defaultValue: null,
        },
      ]);
    });

    it('disallows duplicate parameter names', function() {
      expect(() => Parser.parseParameters([
        'duplicate',
        'duplicate*?',
        'duplicate?',
      ])).to.throw(CommandParserError, 'duplicate parameter names');

      expect(() => Parser.parseParameters([
        'origin:terrace',
        'duplicate',
        'origin:super',
        'duplicate*:some',
      ])).to.throw(CommandParserError, 'duplicate parameter names');
    });

    it('disallows variadic parameters except as the last parameter', function() {
      expect(() => Parser.parseParameters([
        'single:description',
        'array*:should not be here',
        'singleTwo:description',
      ])).to.throw(CommandParserError, 'array can only appear at the end');

      expect(() => Parser.parseParameters([
        'array*:should not be here',
      ])).to.not.throw(CommandParserError);
    });

    it('disallows required parameters after optional parameters', function() {
      expect(() => Parser.parseParameters([
        'optional?',
        'required',
      ])).to.throw(CommandParserError, 'required parameter after optional');
    });
  });

  describe('#parseParameter()', function() {
    it('parses basic arguments', function() {
      expect(Parser.parseParameter('basic')).to.deep.equal({
        name: 'basic',
        description: null,
        arity: Parser.TOKEN.ARITY.UNARY,
        type: Parser.TOKEN.TYPE.STRING,
        optional: false,
        defaultValue: null,
      });
    });

    it('parses descriptions', function() {
      expect(Parser.parseParameter('name:description')).to.containSubset({
        name: 'name',
        description: 'description',
      });

      expect(Parser.parseParameter('name*:description')).to.containSubset({
        name: 'name',
        description: 'description',
      });

      expect(Parser.parseParameter('name?:description')).to.containSubset({
        name: 'name',
        description: 'description',
      });

      expect(Parser.parseParameter('name*?:description')).to.containSubset({
        name: 'name',
        description: 'description',
      });

      expect(Parser.parseParameter('name=default:description')).to.containSubset({
        name: 'name',
        description: 'description',
      });

      expect(Parser.parseParameter('name*=default1 default2:description')).to.containSubset({
        name: 'name',
        description: 'description',
      });

      expect(Parser.parseParameter('name*=default1 default2:description with a : colon')).to.containSubset({
        name: 'name',
        description: 'description with a : colon',
      });
    });

    it('parses variadic arguments', function() {
      expect(Parser.parseParameter('array*')).to.containSubset({
        name: 'array',
        arity: Parser.TOKEN.ARITY.VARIADIC,
        optional: false,
      });
    });

    it('parses optional arguments', function() {
      expect(Parser.parseParameter('optional?')).to.containSubset({
        name: 'optional',
        arity: Parser.TOKEN.ARITY.UNARY,
        optional: true,
        defaultValue: null,
      });
    });

    it('parses optional variadic arguments', function() {
      expect(Parser.parseParameter('array*?')).to.containSubset({
        name: 'array',
        arity: Parser.TOKEN.ARITY.VARIADIC,
        optional: true,
        defaultValue: null,
      });
    });

    it('parses default single arguments', function() {
      expect(Parser.parseParameter('single=true')).to.containSubset({
        name: 'single',
        defaultValue: 'true',
      });
    });

    it('parses default variadic arguments', function() {
      expect(Parser.parseParameter('array*=one two three four')).to.containSubset({
        name: 'array',
        arity: Parser.TOKEN.ARITY.VARIADIC,
        optional: true,
        defaultValue: ['one', 'two', 'three', 'four'],
      });
    });

    it('parses argument names with spaces', function() {
      expect(Parser.parseParameter('name with spaces=some value')).to.containSubset({
        name: 'name with spaces',
        defaultValue: 'some value',
      });

      expect(Parser.parseParameter('array with spaces*=some value')).to.containSubset({
        name: 'array with spaces',
        defaultValue: ['some', 'value'],
      });
    });

    it('parses default variadic values with spaces', function() {
      expect(Parser.parseParameter('array*=\'single quotes\' "double quotes" \'nested "quotes"\'')).to.containSubset({
        name: 'array',
        defaultValue: ['single quotes', 'double quotes', 'nested "quotes"'],
      });
    });

    it('parses parameter types', function() {
      expect(Parser.parseParameter('variable<bool>')).to.containSubset({
        name: 'variable',
        type: Parser.TOKEN.TYPE.BOOLEAN,
      });

      expect(Parser.parseParameter('variable<boolean>')).to.containSubset({
        name: 'variable',
        type: Parser.TOKEN.TYPE.BOOLEAN,
      });

      expect(Parser.parseParameter('variable<integer>')).to.containSubset({
        name: 'variable',
        type: Parser.TOKEN.TYPE.INTEGER,
      });

      expect(Parser.parseParameter('variable<int>')).to.containSubset({
        name: 'variable',
        type: Parser.TOKEN.TYPE.INTEGER,
      });

      expect(Parser.parseParameter('variable<number>')).to.containSubset({
        name: 'variable',
        type: Parser.TOKEN.TYPE.NUMBER,
      });

      expect(Parser.parseParameter('variable<num>')).to.containSubset({
        name: 'variable',
        type: Parser.TOKEN.TYPE.NUMBER,
      });

      expect(Parser.parseParameter('variable<string>')).to.containSubset({
        name: 'variable',
        type: Parser.TOKEN.TYPE.STRING,
      });

      expect(Parser.parseParameter('variable<str>')).to.containSubset({
        name: 'variable',
        type: Parser.TOKEN.TYPE.STRING,
      });

      expect(Parser.parseParameter('variable<num>*:description')).to.containSubset({
        name: 'variable',
        description: 'description',
        arity: Parser.TOKEN.ARITY.VARIADIC,
        type: Parser.TOKEN.TYPE.NUMBER,
      });

      expect(Parser.parseParameter('variable with <> <num> *:description with <>')).to.containSubset({
        name: 'variable with <>',
        description: 'description with <>',
        arity: Parser.TOKEN.ARITY.VARIADIC,
        type: Parser.TOKEN.TYPE.NUMBER,
      });
    });

    it('parses typed default values', function() {
      expect(Parser.parseParameter('name<bool>=true')).to.containSubset({
        name: 'name',
        type: Parser.TOKEN.TYPE.BOOLEAN,
        defaultValue: true,
      });

      expect(Parser.parseParameter('name<bool>=false')).to.containSubset({
        name: 'name',
        type: Parser.TOKEN.TYPE.BOOLEAN,
        defaultValue: false,
      });

      expect(Parser.parseParameter('name<int>=123')).to.containSubset({
        name: 'name',
        type: Parser.TOKEN.TYPE.INTEGER,
        defaultValue: 123,
      });

      expect(Parser.parseParameter('name<int>=123.555')).to.containSubset({
        name: 'name',
        type: Parser.TOKEN.TYPE.INTEGER,
        defaultValue: 123,
      });

      expect(Parser.parseParameter('name<num>=123.555')).to.containSubset({
        name: 'name',
        type: Parser.TOKEN.TYPE.NUMBER,
        defaultValue: 123.555,
      });

      expect(Parser.parseParameter('name<str>=false')).to.containSubset({
        name: 'name',
        type: Parser.TOKEN.TYPE.STRING,
        defaultValue: 'false',
      });

      expect(Parser.parseParameter('name<bool>*=true false "true" false')).to.containSubset({
        name: 'name',
        type: Parser.TOKEN.TYPE.BOOLEAN,
        defaultValue: [true, false, true, false],
      });

      expect(Parser.parseParameter('name<number>*=123 -233 -100.5 0 23.4')).to.containSubset({
        name: 'name',
        type: Parser.TOKEN.TYPE.NUMBER,
        defaultValue: [123, -233, -100.5, 0, 23.4],
      });
    });

    it('strips redundant question marks', function() {
      expect(Parser.parseParameter('single?=true')).to.containSubset({
        name: 'single',
        arity: Parser.TOKEN.ARITY.UNARY,
        optional: true,
        defaultValue: 'true',
      });

      expect(Parser.parseParameter('array*???????=one two')).to.containSubset({
        name: 'array',
        arity: Parser.TOKEN.ARITY.VARIADIC,
        optional: true,
        defaultValue: ['one', 'two'],
      });
    });

    it('strips redundant asterisks', function() {
      expect(Parser.parseParameter('array********')).to.containSubset({
        name: 'array',
        arity: Parser.TOKEN.ARITY.VARIADIC,
      });

      expect(Parser.parseParameter('array****?')).to.containSubset({
        name: 'array',
        arity: Parser.TOKEN.ARITY.VARIADIC,
        optional: true,
      });
    });

    it('strips whitespaces', function() {
      expect(Parser.parseParameter('name     :     desc')).to.containSubset({
        name: 'name',
        description: 'desc',
      });

      expect(Parser.parseParameter('name   =   someVal    :    desc')).to.containSubset({
        name: 'name',
        description: 'desc',
        optional: true,
        defaultValue: 'someVal',
      });

      expect(Parser.parseParameter('array   *  ? = someVal : desc')).to.containSubset({
        name: 'array',
        description: 'desc',
        arity: Parser.TOKEN.ARITY.VARIADIC,
        optional: true,
        defaultValue: ['someVal'],
      });
    });

    it('disallows invalid parameter types', function() {
      expect(() => (
        Parser.parseParameter('name<func>')
      )).to.throw(CommandParserError, 'not a valid parameter type');

      expect(() => (
        Parser.parseParameter('name <NUMB> ?: yeah it\'s me')
      )).to.throw(CommandParserError, 'not a valid parameter type');
    });

    it('disallows invalid default value types', function() {
      expect(() => (
        Parser.parseParameter('array<int>* = hey not an integer 123 !'
      ))).to.throw(CommandParserError, 'Expected default value <hey> to be of type <INTEGER>');

      expect(() => (
        Parser.parseParameter('single<bool>=default:description')
      )).to.throw(CommandParserError, 'Expected default value <default> to be of type <BOOLEAN>');

      expect(() => (
        Parser.parseParameter('single<bool>=true:description')
      )).to.not.throw(CommandParserError, 'Expected default value <true> to be of type <BOOLEAN>');
    });
  });
});
