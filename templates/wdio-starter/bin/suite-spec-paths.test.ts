import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getSuiteSpecFiles } from './suite-spec-paths';

describe('getSuiteSpecFiles', () => {
  it('resolves globs under test/specs', () => {
    const files = getSuiteSpecFiles('./test/specs/**/*.ts');

    assert.ok(files.length > 0);
    assert.ok(files.every((file) => file.endsWith('.ts')));
  });

  it('accepts an array of globs and deduplicates paths', () => {
    const files = getSuiteSpecFiles(['./test/specs/**/*.ts', './test/specs/example.e2e.ts']);

    assert.equal(files.length, new Set(files).size);
  });

  it('returns an empty array when nothing matches', () => {
    const files = getSuiteSpecFiles('./test/specs/does-not-exist/**/*.ts');

    assert.deepEqual(files, []);
  });
});
