import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
import Parser from '../../src/Commands/Parser';

describe('Parser', function() {
  describe('#parseParameter()', function() {
    before(function() {
      chai.use(chaiSubset);
    });

    it('parses basic arguments', function() {
      expect(Parser.parseParameter('basic')).to.deep.equal({
        name: 'basic',
        description: null,
        type: Parser.TOKEN_TYPES.SINGLE,
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
    });

    it('parses array types', function() {
      expect(Parser.parseParameter('array*')).to.containSubset({
        name: 'array',
        type: Parser.TOKEN_TYPES.ARRAY,
        optional: false,
      });
    });

    it('parses optional arguments', function() {
      expect(Parser.parseParameter('optional?')).to.containSubset({
        name: 'optional',
        type: Parser.TOKEN_TYPES.SINGLE,
        optional: true,
        defaultValue: null,
      });
    });

    it('parses optional array arguments', function() {
      expect(Parser.parseParameter('array*?')).to.containSubset({
        name: 'array',
        type: Parser.TOKEN_TYPES.ARRAY,
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

    it('parses default array arguments', function() {
      expect(Parser.parseParameter('array*=one two three four')).to.containSubset({
        name: 'array',
        type: Parser.TOKEN_TYPES.ARRAY,
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

    it('parses default array values with spaces', function() {
      const testString = 'array*=\'single quotes\' "double quotes" \'nested "quotes"\'';
      expect(Parser.parseParameter(testString)).to.containSubset({
        name: 'array',
        defaultValue: ['single quotes', 'double quotes', 'nested "quotes"'],
      });
    });

    it('strips redundant question marks', function() {
      expect(Parser.parseParameter('single?=true')).to.containSubset({
        name: 'single',
        type: Parser.TOKEN_TYPES.SINGLE,
        optional: true,
        defaultValue: 'true',
      });

      expect(Parser.parseParameter('array*???????=one two')).to.containSubset({
        name: 'array',
        type: Parser.TOKEN_TYPES.ARRAY,
        optional: true,
        defaultValue: ['one', 'two'],
      });
    });

    it('strips redundant asterisks', function() {
      expect(Parser.parseParameter('array********')).to.containSubset({
        name: 'array',
        type: Parser.TOKEN_TYPES.ARRAY,
      });

      expect(Parser.parseParameter('array****?')).to.containSubset({
        name: 'array',
        type: Parser.TOKEN_TYPES.ARRAY,
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
        type: Parser.TOKEN_TYPES.ARRAY,
        optional: true,
        defaultValue: ['someVal'],
      });
    });
  });
});
