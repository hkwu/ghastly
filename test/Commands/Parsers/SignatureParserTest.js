import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
import SignatureParser from '../../../src/Commands/Parsers/SignatureParser';
import SignatureParserError from '../../../src/Errors/SignatureParserError';
import { TOKEN } from '../../../src/Commands/Parsers/Constants';

describe('SignatureParser', function() {
  before(function() {
    chai.use(chaiSubset);
  });

  describe('#parse()', function() {
    it('parses basic signatures', function() {
      expect(SignatureParser.parse('sample [command] [other] [foo]')).to.deep.equal({
        identifiers: ['sample'],
        parameters: [
          {
            name: 'command',
            description: null,
            arity: TOKEN.ARITY.UNARY,
            type: TOKEN.TYPE.STRING,
            optional: false,
            defaultValue: null,
          },
          {
            name: 'other',
            description: null,
            arity: TOKEN.ARITY.UNARY,
            type: TOKEN.TYPE.STRING,
            optional: false,
            defaultValue: null,
          },
          {
            name: 'foo',
            description: null,
            arity: TOKEN.ARITY.UNARY,
            type: TOKEN.TYPE.STRING,
            optional: false,
            defaultValue: null,
          },
        ],
      });

      expect(SignatureParser.parse('!sample [param<num?>=123.5 : some description]')).to.deep.equal({
        identifiers: ['!sample'],
        parameters: [
          {
            name: 'param',
            description: 'some description',
            arity: TOKEN.ARITY.UNARY,
            type: TOKEN.TYPE.NUMBER,
            optional: true,
            defaultValue: 123.5,
          },
        ],
      });
    });

    it('parses signatures without parameters', function() {
      expect(SignatureParser.parse('noParams')).to.deep.equal({
        identifiers: ['noParams'],
        parameters: [],
      });
    });

    it('strips whitespace from command name and parameters', function() {
      expect(SignatureParser.parse('   white      [space]   [two]    ')).to.deep.equal({
        identifiers: ['white'],
        parameters: [
          {
            name: 'space',
            description: null,
            arity: TOKEN.ARITY.UNARY,
            type: TOKEN.TYPE.STRING,
            optional: false,
            defaultValue: null,
          },
          {
            name: 'two',
            description: null,
            arity: TOKEN.ARITY.UNARY,
            type: TOKEN.TYPE.STRING,
            optional: false,
            defaultValue: null,
          },
        ],
      });
    });

    it('requires parameter values if text follows the command name', function() {
      expect(() => SignatureParser.parse('name and some values that shouldn\'t be here')).to.throw(
        SignatureParserError,
        'Expected parameter definitions after command name',
      );

      expect(() => SignatureParser.parse('name and some values [with] [params]')).to.not.throw(
        SignatureParserError,
        'Expected parameter definitions after command name',
      );
    });

    it('disallows empty signatures', function() {
      expect(() => SignatureParser.parse('')).to.throw(SignatureParserError, 'Signature cannot be empty');
    });
  });

  describe('#parseIdentifiers()', function() {
    it('parses a single identifier', function() {
      expect(SignatureParser.parseIdentifiers('hello')).to.deep.equal(['hello']);
    });

    it('parses multiple identifiers', function() {
      expect(SignatureParser.parseIdentifiers('hello|hey|there')).to.deep.equal([
        'hello',
        'hey',
        'there',
      ]);
    });

    it('parses RegEx identifiers', function() {
      expect(SignatureParser.parseIdentifiers('/thisis|areg[0-9]xstr\\d/')).to.deep.equal([
        /thisis|areg[0-9]xstr\d/,
      ]);

      expect(SignatureParser.parseIdentifiers('/thisis|areg[0-9]xstr\\d/im')).to.deep.equal([
        /thisis|areg[0-9]xstr\d/im,
      ]);

      expect(SignatureParser.parseIdentifiers('/thisis|a[^not]reg[0-9]xstr\\d')).to.deep.equal([
        '/thisis',
        'a[^not]reg[0-9]xstr\\d',
      ]);

      expect(SignatureParser.parseIdentifiers('/thisis|a[^not]//reg[0-9]xstr\\d/')).to.deep.equal([
        /thisis|a[^not]\/\/reg[0-9]xstr\d/,
      ]);

      expect(SignatureParser.parseIdentifiers('//')).to.deep.equal([
        '//',
      ]);
    });
  });

  describe('#parseParameters()', function() {
    it('parses basic parameters', function() {
      expect(SignatureParser.parseParameters([
        'name:description',
        'argument?:optional',
        'array*?:description',
      ])).to.deep.equal([
        {
          name: 'name',
          description: 'description',
          arity: TOKEN.ARITY.UNARY,
          type: TOKEN.TYPE.STRING,
          optional: false,
          defaultValue: null,
        },
        {
          name: 'argument',
          description: 'optional',
          arity: TOKEN.ARITY.UNARY,
          type: TOKEN.TYPE.STRING,
          optional: true,
          defaultValue: null,
        },
        {
          name: 'array',
          description: 'description',
          arity: TOKEN.ARITY.VARIADIC,
          type: TOKEN.TYPE.STRING,
          optional: true,
          defaultValue: [],
        },
      ]);
    });

    it('disallows duplicate parameter names', function() {
      expect(() => SignatureParser.parseParameters([
        'duplicate',
        'duplicate*?',
        'duplicate?',
      ])).to.throw(SignatureParserError, 'duplicate parameter names');

      expect(() => SignatureParser.parseParameters([
        'origin:terrace',
        'duplicate',
        'origin:super',
        'duplicate*:some',
      ])).to.throw(SignatureParserError, 'duplicate parameter names');
    });

    it('disallows variadic parameters except as the last parameter', function() {
      expect(() => SignatureParser.parseParameters([
        'single:description',
        'array*:should not be here',
        'singleTwo:description',
      ])).to.throw(
        SignatureParserError,
        'Variable length parameters can only appear at the end of the command signature.',
      );

      expect(() => SignatureParser.parseParameters([
        'array*:should not be here',
      ])).to.not.throw(SignatureParserError);
    });

    it('disallows required parameters after optional parameters', function() {
      expect(() => SignatureParser.parseParameters([
        'optional?',
        'required',
      ])).to.throw(SignatureParserError, 'required parameter after optional');
    });
  });

  describe('#parseTokenModifiers()', function() {
    it('parses basic tokens', function() {
      expect(SignatureParser.parseTokenModifiers('hello *?')).to.deep.equal({
        optional: true,
        arity: TOKEN.ARITY.VARIADIC,
        value: 'hello',
      });

      expect(SignatureParser.parseTokenModifiers('hello ?*')).to.deep.equal({
        arity: TOKEN.ARITY.VARIADIC,
        value: 'hello ?',
      });
    });

    it('parses optional modifiers', function() {
      expect(SignatureParser.parseTokenModifiers('hello ??')).to.deep.equal({
        optional: true,
        value: 'hello',
      });

      expect(SignatureParser.parseTokenModifiers('hello ?? momo')).to.deep.equal({
        value: 'hello ?? momo',
      });
    });

    it('parses variadic modifiers', function() {
      expect(SignatureParser.parseTokenModifiers('hello **')).to.deep.equal({
        arity: TOKEN.ARITY.VARIADIC,
        value: 'hello',
      });

      expect(SignatureParser.parseTokenModifiers('hello ** momo')).to.deep.equal({
        value: 'hello ** momo',
      });
    });
  });

  describe('#parseParameter()', function() {
    it('parses basic arguments', function() {
      expect(SignatureParser.parseParameter('basic')).to.deep.equal({
        name: 'basic',
        description: null,
        arity: TOKEN.ARITY.UNARY,
        type: TOKEN.TYPE.STRING,
        optional: false,
        defaultValue: null,
      });
    });

    it('parses descriptions', function() {
      expect(SignatureParser.parseParameter('name:description')).to.containSubset({
        name: 'name',
        description: 'description',
      });

      expect(SignatureParser.parseParameter('name*:description')).to.containSubset({
        name: 'name',
        description: 'description',
      });

      expect(SignatureParser.parseParameter('name?:description')).to.containSubset({
        name: 'name',
        description: 'description',
      });

      expect(SignatureParser.parseParameter('name*?:description')).to.containSubset({
        name: 'name',
        description: 'description',
      });

      expect(SignatureParser.parseParameter('name=default:description')).to.containSubset({
        name: 'name',
        description: 'description',
      });

      expect(SignatureParser.parseParameter('name*=default1 default2:description')).to.containSubset({
        name: 'name',
        description: 'description',
      });

      expect(SignatureParser.parseParameter('name*=default1 default2:description with a : colon')).to.containSubset({
        name: 'name',
        description: 'description with a : colon',
      });
    });

    it('parses variadic arguments', function() {
      expect(SignatureParser.parseParameter('array*')).to.containSubset({
        name: 'array',
        arity: TOKEN.ARITY.VARIADIC,
        optional: false,
      });
    });

    it('parses optional arguments', function() {
      expect(SignatureParser.parseParameter('optional?')).to.containSubset({
        name: 'optional',
        arity: TOKEN.ARITY.UNARY,
        optional: true,
        defaultValue: null,
      });
    });

    it('parses optional variadic arguments', function() {
      expect(SignatureParser.parseParameter('array*?')).to.containSubset({
        name: 'array',
        arity: TOKEN.ARITY.VARIADIC,
        optional: true,
        defaultValue: [],
      });
    });

    it('parses default single arguments', function() {
      expect(SignatureParser.parseParameter('single=true')).to.containSubset({
        name: 'single',
        defaultValue: 'true',
      });
    });

    it('parses default variadic arguments', function() {
      expect(SignatureParser.parseParameter('array*=one two three four')).to.containSubset({
        name: 'array',
        arity: TOKEN.ARITY.VARIADIC,
        optional: true,
        defaultValue: ['one', 'two', 'three', 'four'],
      });
    });

    it('parses argument names with spaces', function() {
      expect(SignatureParser.parseParameter('name with spaces=some value')).to.containSubset({
        name: 'name with spaces',
        defaultValue: 'some value',
      });

      expect(SignatureParser.parseParameter('array with spaces*=some value')).to.containSubset({
        name: 'array with spaces',
        defaultValue: ['some', 'value'],
      });
    });

    it('parses default variadic values with spaces', function() {
      expect(SignatureParser.parseParameter('array*=\'single quotes\' "double quotes" \'nested "quotes"\'')).to.containSubset({
        name: 'array',
        defaultValue: ['single quotes', 'double quotes', 'nested "quotes"'],
      });
    });

    it('parses parameter types', function() {
      expect(SignatureParser.parseParameter('variable<bool>')).to.containSubset({
        name: 'variable',
        type: TOKEN.TYPE.BOOLEAN,
      });

      expect(SignatureParser.parseParameter('variable<boolean>')).to.containSubset({
        name: 'variable',
        type: TOKEN.TYPE.BOOLEAN,
      });

      expect(SignatureParser.parseParameter('variable<integer>')).to.containSubset({
        name: 'variable',
        type: TOKEN.TYPE.INTEGER,
      });

      expect(SignatureParser.parseParameter('variable<int>')).to.containSubset({
        name: 'variable',
        type: TOKEN.TYPE.INTEGER,
      });

      expect(SignatureParser.parseParameter('variable<number>')).to.containSubset({
        name: 'variable',
        type: TOKEN.TYPE.NUMBER,
      });

      expect(SignatureParser.parseParameter('variable<num>')).to.containSubset({
        name: 'variable',
        type: TOKEN.TYPE.NUMBER,
      });

      expect(SignatureParser.parseParameter('variable<string>')).to.containSubset({
        name: 'variable',
        type: TOKEN.TYPE.STRING,
      });

      expect(SignatureParser.parseParameter('variable<str>')).to.containSubset({
        name: 'variable',
        type: TOKEN.TYPE.STRING,
      });

      expect(SignatureParser.parseParameter('variable<num*>:description')).to.containSubset({
        name: 'variable',
        description: 'description',
        arity: TOKEN.ARITY.VARIADIC,
        type: TOKEN.TYPE.NUMBER,
      });

      expect(SignatureParser.parseParameter('variable with <> <num *>:description with <>')).to.containSubset({
        name: 'variable with <>',
        description: 'description with <>',
        arity: TOKEN.ARITY.VARIADIC,
        type: TOKEN.TYPE.NUMBER,
      });
    });

    it('parses typed default values', function() {
      expect(SignatureParser.parseParameter('name<bool>=true')).to.containSubset({
        name: 'name',
        type: TOKEN.TYPE.BOOLEAN,
        defaultValue: true,
      });

      expect(SignatureParser.parseParameter('name<bool>=false')).to.containSubset({
        name: 'name',
        type: TOKEN.TYPE.BOOLEAN,
        defaultValue: false,
      });

      expect(SignatureParser.parseParameter('name<int>=123')).to.containSubset({
        name: 'name',
        type: TOKEN.TYPE.INTEGER,
        defaultValue: 123,
      });

      expect(SignatureParser.parseParameter('name<int>=123.555')).to.containSubset({
        name: 'name',
        type: TOKEN.TYPE.INTEGER,
        defaultValue: 123,
      });

      expect(SignatureParser.parseParameter('name<num>=123.555')).to.containSubset({
        name: 'name',
        type: TOKEN.TYPE.NUMBER,
        defaultValue: 123.555,
      });

      expect(SignatureParser.parseParameter('name<str>=false')).to.containSubset({
        name: 'name',
        type: TOKEN.TYPE.STRING,
        defaultValue: 'false',
      });

      expect(SignatureParser.parseParameter('name<bool*>=true false "true" false')).to.containSubset({
        name: 'name',
        type: TOKEN.TYPE.BOOLEAN,
        defaultValue: [true, false, true, false],
      });

      expect(SignatureParser.parseParameter('name<number*>=123 -233 -100.5 0 23.4')).to.containSubset({
        name: 'name',
        type: TOKEN.TYPE.NUMBER,
        defaultValue: [123, -233, -100.5, 0, 23.4],
      });
    });

    it('strips redundant question marks', function() {
      expect(SignatureParser.parseParameter('single?=true')).to.containSubset({
        name: 'single',
        arity: TOKEN.ARITY.UNARY,
        optional: true,
        defaultValue: 'true',
      });

      expect(SignatureParser.parseParameter('array*???????=one two')).to.containSubset({
        name: 'array',
        arity: TOKEN.ARITY.VARIADIC,
        optional: true,
        defaultValue: ['one', 'two'],
      });
    });

    it('strips redundant asterisks', function() {
      expect(SignatureParser.parseParameter('array********')).to.containSubset({
        name: 'array',
        arity: TOKEN.ARITY.VARIADIC,
      });

      expect(SignatureParser.parseParameter('array****?')).to.containSubset({
        name: 'array',
        arity: TOKEN.ARITY.VARIADIC,
        optional: true,
      });
    });

    it('strips whitespaces', function() {
      expect(SignatureParser.parseParameter('name     :     desc')).to.containSubset({
        name: 'name',
        description: 'desc',
      });

      expect(SignatureParser.parseParameter('name   =   someVal    :    desc')).to.containSubset({
        name: 'name',
        description: 'desc',
        optional: true,
        defaultValue: 'someVal',
      });

      expect(SignatureParser.parseParameter('array   *  ? = someVal : desc')).to.containSubset({
        name: 'array',
        description: 'desc',
        arity: TOKEN.ARITY.VARIADIC,
        optional: true,
        defaultValue: ['someVal'],
      });
    });

    it('disallows invalid parameter types', function() {
      expect(() => (
        SignatureParser.parseParameter('name<func>')
      )).to.throw(SignatureParserError, 'not a valid parameter type');

      expect(() => (
        SignatureParser.parseParameter('name <NUMB ?>: yeah it\'s me')
      )).to.throw(SignatureParserError, 'not a valid parameter type');
    });

    it('disallows invalid default value types', function() {
      expect(() => (
        SignatureParser.parseParameter('array<int* >= hey not an integer 123 !'
      ))).to.throw(SignatureParserError, 'Expected default value <hey> to be of type <INTEGER>');

      expect(() => (
        SignatureParser.parseParameter('single<bool>=default:description')
      )).to.throw(SignatureParserError, 'Expected default value <default> to be of type <BOOLEAN>');

      expect(() => (
        SignatureParser.parseParameter('single<bool>=true:description')
      )).to.not.throw(SignatureParserError, 'Expected default value <true> to be of type <BOOLEAN>');
    });
  });
});
