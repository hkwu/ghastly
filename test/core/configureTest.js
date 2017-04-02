import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
import configure from '../../src/core/configure';

describe('configure()', function () {
  before(function () {
    chai.use(chaiSubset);
  });

  describe('object configurations', function () {
    it('changes configurations', function () {
      const originalConfigurator = () => ({
        handler() {},
        triggers: ['hairy'],
        description: 'Foosball',
      });
      const generatedConfigurator = configure({ description: 'Bar' })(originalConfigurator);

      expect(generatedConfigurator({})).to.containSubset({ description: 'Bar' });
    });

    it('configures default properties', function () {
      const originalConfigurator = () => ({
        handler() {},
        triggers: ['original'],
        description: 'original',
      });
      const generatedConfigurator = configure({
        triggers: [
          'one',
          'two',
          'three',
        ],
        description: 'Something.',
      })(originalConfigurator);

      expect(generatedConfigurator({})).to.containSubset({
        triggers: [
          'one',
          'two',
          'three',
        ],
        description: 'Something.',
      });
    });

    it('configures middleware properly', function () {
      const originalConfigurator = () => ({
        handler() {},
        triggers: ['original'],
        description: 'original',
        middleware: [
          'three',
          'four',
        ],
      });
      const generatedConfigurator = configure({
        middleware: [
          'one',
          'two',
        ],
      })(originalConfigurator);

      expect(generatedConfigurator({})).to.containSubset({
        triggers: ['original'],
        description: 'original',
        middleware: [
          'one',
          'two',
          'three',
          'four',
        ],
      });
    });

    it('configures non-default properties', function () {
      const originalConfigurator = ({ additionalTriggers }) => ({
        handler() {},
        triggers: ['original', ...additionalTriggers],
        description: 'original',
      });
      const generatedConfigurator = configure({
        description: 'Something.',
        additionalTriggers: [
          'four',
          'five',
        ],
      })(originalConfigurator);

      expect(generatedConfigurator({})).to.containSubset({
        triggers: [
          'original',
          'four',
          'five',
        ],
        description: 'Something.',
      });
    });

    it('configures multiple times', function () {
      const originalConfigurator = ({ additionalTriggers }) => ({
        handler() {},
        triggers: ['original', ...additionalTriggers],
        description: 'original',
      });
      const applicators = [
        configure({
          description: 'Something.',
          additionalTriggers: [
            'four',
            'five',
          ],
        }),
        configure({
          triggers: ['foo'],
          description: 'Unbelievable.',
        }),
      ];
      const generatedConfigurator = applicators.reduce(
        (configurator, applicator) => applicator(configurator),
        originalConfigurator,
      );

      expect(generatedConfigurator({})).to.containSubset({
        triggers: ['foo'],
        description: 'Unbelievable.',
      });
    });

    it('validates configurations', function () {
      const originalConfigurator = () => ({
        handler() {},
      });
      const generatedConfigurator = configure({})(originalConfigurator);

      expect(() => generatedConfigurator({})).to.throw(Error);
    });
  });
});
