/**
 * Tests for utility functions
 */

import { cn, formatDate, formatRelativeTime, generateId, getInitials, sleep, truncate } from '../utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
      expect(cn('foo', true && 'bar', 'baz')).toBe('foo bar baz');
    });

    it('should handle arrays of classes', () => {
      expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
    });

    it('should deduplicate tailwind classes', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2');
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('should handle undefined and null', () => {
      expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
    });

    it('should handle empty input', () => {
      expect(cn()).toBe('');
    });
  });

  describe('formatDate', () => {
    it('should format a Date object', () => {
      const date = new Date('2024-03-15');
      const result = formatDate(date);
      expect(result).toMatch(/Mar 15, 2024/);
    });

    it('should format a date string', () => {
      const result = formatDate('2024-03-15');
      expect(result).toMatch(/Mar 15, 2024/);
    });

    it('should accept custom options', () => {
      const result = formatDate('2024-03-15', { month: 'long' });
      expect(result).toMatch(/March/);
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return "just now" for very recent times', () => {
      const now = new Date();
      jest.setSystemTime(now);

      const result = formatRelativeTime(now);
      expect(result).toBe('just now');
    });

    it('should return minutes ago', () => {
      const now = new Date('2024-03-15T12:00:00Z');
      jest.setSystemTime(now);

      const fiveMinutesAgo = new Date('2024-03-15T11:55:00Z');
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
    });

    it('should return singular form for 1 minute', () => {
      const now = new Date('2024-03-15T12:00:00Z');
      jest.setSystemTime(now);

      const oneMinuteAgo = new Date('2024-03-15T11:59:00Z');
      expect(formatRelativeTime(oneMinuteAgo)).toBe('1 minute ago');
    });

    it('should return hours ago', () => {
      const now = new Date('2024-03-15T12:00:00Z');
      jest.setSystemTime(now);

      const twoHoursAgo = new Date('2024-03-15T10:00:00Z');
      expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago');
    });

    it('should return days ago', () => {
      const now = new Date('2024-03-15T12:00:00Z');
      jest.setSystemTime(now);

      const threeDaysAgo = new Date('2024-03-12T12:00:00Z');
      expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago');
    });

    it('should return weeks ago', () => {
      const now = new Date('2024-03-15T12:00:00Z');
      jest.setSystemTime(now);

      const twoWeeksAgo = new Date('2024-03-01T12:00:00Z');
      expect(formatRelativeTime(twoWeeksAgo)).toBe('2 weeks ago');
    });

    it('should return months ago', () => {
      const now = new Date('2024-03-15T12:00:00Z');
      jest.setSystemTime(now);

      const twoMonthsAgo = new Date('2024-01-15T12:00:00Z');
      expect(formatRelativeTime(twoMonthsAgo)).toBe('2 months ago');
    });

    it('should return years ago', () => {
      const now = new Date('2024-03-15T12:00:00Z');
      jest.setSystemTime(now);

      const twoYearsAgo = new Date('2022-03-15T12:00:00Z');
      expect(formatRelativeTime(twoYearsAgo)).toBe('2 years ago');
    });

    it('should handle string input', () => {
      const now = new Date('2024-03-15T12:00:00Z');
      jest.setSystemTime(now);

      expect(formatRelativeTime('2024-03-15T11:00:00Z')).toBe('1 hour ago');
    });
  });

  describe('truncate', () => {
    it('should not truncate short strings', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });

    it('should truncate long strings', () => {
      expect(truncate('hello world', 5)).toBe('hello...');
    });

    it('should handle exact length', () => {
      expect(truncate('hello', 5)).toBe('hello');
    });

    it('should handle empty string', () => {
      expect(truncate('', 5)).toBe('');
    });
  });

  describe('getInitials', () => {
    it('should return initials from a two-word name', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('should return initials from a single-word name', () => {
      expect(getInitials('John')).toBe('J');
    });

    it('should return first two initials for longer names', () => {
      expect(getInitials('John Michael Doe')).toBe('JM');
    });

    it('should handle lowercase names', () => {
      expect(getInitials('john doe')).toBe('JD');
    });

    it('should handle mixed case names', () => {
      expect(getInitials('jOHN dOE')).toBe('JD');
    });
  });

  describe('sleep', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should resolve after specified time', async () => {
      const promise = sleep(1000);

      jest.advanceTimersByTime(999);
      expect(jest.getTimerCount()).toBe(1);

      jest.advanceTimersByTime(1);
      await promise;
      expect(jest.getTimerCount()).toBe(0);
    });
  });

  describe('generateId', () => {
    it('should generate a string', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
    });

    it('should generate a non-empty string', () => {
      const id = generateId();
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(100);
    });
  });
});
