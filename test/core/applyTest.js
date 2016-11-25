import { expect } from 'chai';
import apply from '../../src/core/apply';

describe('apply', function() {
  it('composes functions properly', function() {
    const coreA = (arg1, arg2) => ({ arg1, arg2 });
    const middlewareA = (next, arg1, arg2) => next(arg1, arg2);

    expect(apply(middlewareA)(coreA)(1, 2)).to.deep.equal({ arg1: 1, arg2: 2 });

    const middlewareB = next => next();

    expect(apply(middlewareB)(coreA)(1, 2)).to.deep.equal({ arg1: undefined, arg2: undefined });

    const coreB = (...args) => args;
    const middlewareC = (next, ...args) => next(...args);

    expect(apply(middlewareC)(coreB)()).to.deep.equal([]);
    expect(apply(middlewareC)(coreB)(1)).to.deep.equal([1]);
    expect(apply(middlewareC)(coreB)(1, 2)).to.deep.equal([1, 2]);
    expect(apply(middlewareC)(coreB)(1, 2, 3)).to.deep.equal([1, 2, 3]);
    expect(apply(middlewareC)(coreB)([1, 2, 3])).to.deep.equal([[1, 2, 3]]);
  });

  it('composes multiple middleware properly', function() {
    const core = (arg1, arg2) => ({ arg1, arg2 });
    const middlewareA = (next, arg1, arg2) => next(arg1, arg2);
    const middlewareB = next => next();
    const middlewareC = (next, ...args) => next(...args);

    expect(apply(middlewareA, middlewareB)(core)(1, 2)).to.deep.equal({ arg1: undefined, arg2: undefined });
    expect(apply(middlewareA, middlewareC)(core)(1, 2)).to.deep.equal({ arg1: 1, arg2: 2 });
    expect(apply(middlewareC, middlewareA)(core)(1, 2)).to.deep.equal({ arg1: 1, arg2: 2 });
  });

  it('composes functions from right to left', function() {
    const core = arg => arg;
    const middlewareA = (next, arg) => next(`${arg}+middlewareA`);
    const middlewareB = (next, arg) => next(`${arg}+middlewareB`);

    expect(apply(middlewareA, middlewareB)(core)('arg')).to.equal('arg+middlewareA+middlewareB');
    expect(apply(middlewareB, middlewareA)(core)('arg')).to.equal('arg+middlewareB+middlewareA');
  });

  it('works with before and after middleware', function() {
    const core = arg => arg;
    const beforeMiddleware = (next, arg) => next(`(before ${arg})`);
    const afterMiddleware = (next, arg) => {
      const result = next(arg);

      return `(after ${result})`;
    };

    expect(apply(beforeMiddleware, afterMiddleware)(core)('arg')).to.equal('(after (before arg))');
    expect(apply(afterMiddleware, beforeMiddleware)(core)('arg')).to.equal('(after (before arg))');
  });

  it('disallows invalid middleware', function() {
    const core = (arg1, arg2) => ({ arg1, arg2 });
    const middlewareA = (next, arg1, arg2) => next(arg1, arg2);
    const middlewareB = next => next();
    const middlewareC = (next, ...args) => next(...args);

    expect(() => apply(middlewareA, middlewareB, 2, middlewareC)(core)).to.throw(TypeError, 'Expected all provided middleware to be functions.');
    expect(() => apply(2)(core)).to.throw(TypeError, 'Expected all provided middleware to be functions.');
  });

  it('disallows invalid handlers', function() {
    const middlewareA = (next, arg1, arg2) => next(arg1, arg2);

    expect(() => apply(middlewareA)(2)).to.throw(TypeError, 'Expected handler to be a function.');
  });
});
