import { expect } from 'chai';
import Parser from '../../src/Commands/Parser';

describe('Parser', function() {
  describe('#parseParameter()', function() {
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
      const single = Parser.parseParameter('name:description');
      expect(single.name).to.equal('name');
      expect(single.description).to.equal('description');

      const array = Parser.parseParameter('name*:description');
      expect(array.name).to.equal('name');
      expect(array.description).to.equal('description');

      const singleOptional = Parser.parseParameter('name?:description');
      expect(singleOptional.name).to.equal('name');
      expect(singleOptional.description).to.equal('description');

      const arrayOptional = Parser.parseParameter('name*?:description');
      expect(arrayOptional.name).to.equal('name');
      expect(arrayOptional.description).to.equal('description');

      const singleDefault = Parser.parseParameter('name=default:description');
      expect(singleDefault.name).to.equal('name');
      expect(singleDefault.description).to.equal('description');

      const arrayDefault = Parser.parseParameter('name*=default1 default2:description');
      expect(arrayDefault.name).to.equal('name');
      expect(arrayDefault.description).to.equal('description');
    });

    it('parses array types', function() {
      const parsed = Parser.parseParameter('array*');
      expect(parsed.name).to.equal('array');
      expect(parsed.type).to.equal(Parser.TOKEN_TYPES.ARRAY);
    });

    it('parses optional arguments', function() {
      const parsed = Parser.parseParameter('optional?');
      expect(parsed.name).to.equal('optional');
      expect(parsed.optional).to.be.true;
    });

    it('parses optional array arguments', function() {
      const parsed = Parser.parseParameter('array*?');
      expect(parsed.name).to.equal('array');
      expect(parsed.type).to.equal(Parser.TOKEN_TYPES.ARRAY);
      expect(parsed.optional).to.be.true;
    });

    it('parses default single arguments', function() {
      const noWhitespace = Parser.parseParameter('single=true');
      expect(noWhitespace.name).to.equal('single');
      expect(noWhitespace.defaultValue).to.equal('true');

      const withWhitespace = Parser.parseParameter('single    =    true');
      expect(withWhitespace.name).to.equal('single');
      expect(withWhitespace.defaultValue).to.equal('true');
    });

    it('parses default array arguments', function() {
      const parsed = Parser.parseParameter('array*=one two three four');
      expect(parsed.name).to.equal('array');
      expect(parsed.type).to.equal(Parser.TOKEN_TYPES.ARRAY);
      expect(parsed.optional).to.be.true;
      expect(parsed.defaultValue).to.deep.equal(['one', 'two', 'three', 'four']);
    });

    it('strips redundant question marks', function() {
      const singleOptional = Parser.parseParameter('single?=true');
      expect(singleOptional.name).to.equal('single');
      expect(singleOptional.type).to.equal(Parser.TOKEN_TYPES.SINGLE);
      expect(singleOptional.optional).to.be.true;
      expect(singleOptional.defaultValue).to.equal('true');

      const arrayOptional = Parser.parseParameter('array*???????=one two');
      expect(arrayOptional.name).to.equal('array');
      expect(arrayOptional.type).to.equal(Parser.TOKEN_TYPES.ARRAY);
      expect(arrayOptional.optional).to.be.true;
      expect(arrayOptional.defaultValue).to.deep.equal(['one', 'two']);
    });

    it('strips redundant asterisks', function() {
      const requiredArray = Parser.parseParameter('array********');
      expect(requiredArray.name).to.equal('array');
      expect(requiredArray.type).to.equal(Parser.TOKEN_TYPES.ARRAY);

      const optionalArray = Parser.parseParameter('array****?');
      expect(optionalArray.name).to.equal('array');
      expect(optionalArray.type).to.equal(Parser.TOKEN_TYPES.ARRAY);
      expect(optionalArray.optional).to.be.true;
    });

    it('strips whitespaces', function() {
      const descriptionWhitespace = Parser.parseParameter('name     :     desc');
      expect(descriptionWhitespace.name).to.equal('name');
      expect(descriptionWhitespace.description).to.equal('desc');
    });
  });
});
