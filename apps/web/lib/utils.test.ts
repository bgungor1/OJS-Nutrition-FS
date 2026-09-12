import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('merges single and multiple class names correctly', () => {
    expect(cn('flex', 'items-center', 'justify-between')).toBe('flex items-center justify-between');
  });

  it('resolves Tailwind class conflicts based on last defined class', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('text-red-500', 'text-blue-600')).toBe('text-blue-600');
    expect(cn('block', 'inline-block')).toBe('inline-block');
  });

  it('evaluates conditional object syntax correctly', () => {
    expect(cn('btn', { 'btn-active': true, 'btn-disabled': false })).toBe('btn btn-active');
  });

  it('filters out falsy, null, undefined, and empty string values', () => {
    expect(cn('base-class', null, undefined, false, '', 0 && 'zero-class', 'valid-class')).toBe(
      'base-class valid-class',
    );
  });

  it('flattens and merges nested array structures', () => {
    expect(cn(['font-bold', ['text-center', ['underline']]])).toBe('font-bold text-center underline');
  });

  it('returns empty string when called with no arguments or only falsy values', () => {
    expect(cn()).toBe('');
    expect(cn(null, undefined, false)).toBe('');
  });
});
