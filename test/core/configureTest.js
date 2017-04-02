import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
import configure from '../../src/core/configure';

describe('configure()', function () {
  before(function () {
    chai.use(chaiSubset);
  });

  describe('object configurations', function () {
    it('changes configurations', function () {
      const originalConfigurator = () => ({ description: 'Foosball' });
      const generatedConfigurator = configure({ description: 'Bar' })(originalConfigurator);

      expect(generatedConfigurator()).to.containSubset({ description: 'Bar' });
    });

    it('configures default properties', function () {
      const originalConfigurator = () => ({
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

      expect(generatedConfigurator()).to.containSubset({
        triggers: [
          'one',
          'two',
          'three',
        ],
        description: 'Something.',
      });
    });

    it('configures non-default properties', function () {
      const originalConfigurator = ({ additionalTriggers }) => ({
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

      expect(generatedConfigurator()).to.containSubset({
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

      expect(generatedConfigurator()).to.containSubset({
        triggers: ['foo'],
        description: 'Unbelievable.',
      });
    });
  });

  describe('function configurations', function () {
    it('changes configurations', function () {
      const originalConfigurator = () => ({ description: 'Foosball' });
      const generatedConfigurator = configure((configuration) => ({
        ...configuration,
        description: 'Bar',
      }))(originalConfigurator);

      expect(generatedConfigurator()).to.containSubset({ description: 'Bar' });
    });
  });
});
