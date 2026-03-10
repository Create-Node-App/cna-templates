/**
 * Tests for Pattern Detectors
 */

import {
  detectAllPatterns,
  detectCapabilityMentionPatterns,
  detectCapabilityPatterns,
  detectComparisonPatterns,
  type DetectedCapability,
  type DetectedComparison,
  type DetectedPattern,
  type DetectedPerson,
  type DetectedSkill,
  detectPersonPatterns,
  detectSkillListPatterns,
  hasGenUIPatterns,
} from '../pattern-detectors';

// ============================================================================
// TYPE GUARDS FOR TEST ASSERTIONS
// ============================================================================

type PersonPattern = Extract<DetectedPattern, { type: 'person' }>;
type SkillListPattern = Extract<DetectedPattern, { type: 'skill_list' }>;
type ComparisonPattern = Extract<DetectedPattern, { type: 'comparison' }>;
type CapabilityPattern = Extract<DetectedPattern, { type: 'capability' }>;

function assertPersonPattern(pattern: DetectedPattern): asserts pattern is PersonPattern {
  if (pattern.type !== 'person') {
    throw new Error(`Expected person pattern, got ${pattern.type}`);
  }
}

function assertSkillListPattern(pattern: DetectedPattern): asserts pattern is SkillListPattern {
  if (pattern.type !== 'skill_list') {
    throw new Error(`Expected skill_list pattern, got ${pattern.type}`);
  }
}

function assertComparisonPattern(pattern: DetectedPattern): asserts pattern is ComparisonPattern {
  if (pattern.type !== 'comparison') {
    throw new Error(`Expected comparison pattern, got ${pattern.type}`);
  }
}

function assertCapabilityPattern(pattern: DetectedPattern): asserts pattern is CapabilityPattern {
  if (pattern.type !== 'capability') {
    throw new Error(`Expected capability pattern, got ${pattern.type}`);
  }
}

// Helper to get person data with type safety
function getPersonData(pattern: DetectedPattern): DetectedPerson {
  assertPersonPattern(pattern);
  return pattern.data;
}

// Helper to get skill list data with type safety
function getSkillListData(pattern: DetectedPattern): DetectedSkill[] {
  assertSkillListPattern(pattern);
  return pattern.data;
}

// Helper to get comparison data with type safety
function getComparisonData(pattern: DetectedPattern): DetectedComparison {
  assertComparisonPattern(pattern);
  return pattern.data;
}

// Helper to get capability data with type safety
function getCapabilityData(pattern: DetectedPattern): DetectedCapability {
  assertCapabilityPattern(pattern);
  return pattern.data;
}

// ============================================================================
// TESTS
// ============================================================================

describe('Pattern Detectors', () => {
  describe('detectPersonPatterns', () => {
    it('should detect person with department', () => {
      const text = '• **John Doe** - Engineering';
      const patterns = detectPersonPatterns(text);

      expect(patterns).toHaveLength(1);
      expect(patterns[0].type).toBe('person');

      const data = getPersonData(patterns[0]);
      expect(data.name).toBe('John Doe');
      expect(data.department).toBe('Engineering');
    });

    it('should detect person with skills', () => {
      const text = '• **Jane Smith** - Design\n  Skills: React (4), TypeScript (5)';
      const patterns = detectPersonPatterns(text);

      expect(patterns).toHaveLength(1);
      const data = getPersonData(patterns[0]);
      expect(data.name).toBe('Jane Smith');
      expect(data.department).toBe('Design');
      expect(data.skills).toHaveLength(2);
      expect(data.skills?.[0]).toEqual({ name: 'React', level: 4 });
      expect(data.skills?.[1]).toEqual({ name: 'TypeScript', level: 5 });
    });

    it('should detect multiple persons', () => {
      const text = '• **Alice** - Frontend\n• **Bob** - Backend';
      const patterns = detectPersonPatterns(text);

      expect(patterns).toHaveLength(2);
      expect(getPersonData(patterns[0]).name).toBe('Alice');
      expect(getPersonData(patterns[1]).name).toBe('Bob');
    });

    it('should handle dash bullet points', () => {
      const text = '- **Carlos** - DevOps';
      const patterns = detectPersonPatterns(text);

      expect(patterns).toHaveLength(1);
      expect(getPersonData(patterns[0]).name).toBe('Carlos');
    });

    it('should return empty array for no matches', () => {
      const text = 'This is just plain text without any patterns.';
      const patterns = detectPersonPatterns(text);

      expect(patterns).toHaveLength(0);
    });

    it('should capture start and end indices', () => {
      const text = 'Some text before • **Test Person** - Testing after';
      const patterns = detectPersonPatterns(text);

      expect(patterns).toHaveLength(1);
      expect(patterns[0].startIndex).toBeGreaterThan(0);
      expect(patterns[0].endIndex).toBeGreaterThan(patterns[0].startIndex);
    });
  });

  describe('detectSkillListPatterns', () => {
    it('should detect skill list with levels', () => {
      const text = '• React (4), TypeScript (5), Node.js (3)';
      const patterns = detectSkillListPatterns(text);

      expect(patterns).toHaveLength(1);
      expect(patterns[0].type).toBe('skill_list');

      const data = getSkillListData(patterns[0]);
      expect(data).toHaveLength(3);
      expect(data[0]).toEqual({ name: 'React', level: 4, raw: 'React (4)' });
    });

    it('should handle multiple skill lines', () => {
      const text = '• JavaScript (4)\n• Python (3)\n• Go (2)';
      const patterns = detectSkillListPatterns(text);

      expect(patterns).toHaveLength(3);
    });

    it('should ignore lines without skills in parentheses', () => {
      const text = '• This is just a bullet point without skills';
      const patterns = detectSkillListPatterns(text);

      expect(patterns).toHaveLength(0);
    });

    it('should handle dash bullet points', () => {
      const text = '- Java (4), Kotlin (3)';
      const patterns = detectSkillListPatterns(text);

      expect(patterns).toHaveLength(1);
      expect(getSkillListData(patterns[0])).toHaveLength(2);
    });
  });

  describe('detectComparisonPatterns', () => {
    it('should detect markdown table', () => {
      const text = `
| Skill | Person A | Person B |
|-------|----------|----------|
| React | 4 | 5 |
| Node | 3 | 4 |
`;
      const patterns = detectComparisonPatterns(text);

      expect(patterns).toHaveLength(1);
      expect(patterns[0].type).toBe('comparison');

      const data = getComparisonData(patterns[0]);
      expect(data.headers).toEqual(['Skill', 'Person A', 'Person B']);
      expect(data.rows).toHaveLength(2);
      expect(data.rows[0]).toEqual({ skill: 'React', values: ['4', '5'] });
    });

    it('should require at least 3 columns for comparison', () => {
      const text = `
| Skill | Level |
|-------|-------|
| React | 4 |
`;
      const patterns = detectComparisonPatterns(text);

      expect(patterns).toHaveLength(0);
    });

    it('should handle tables with more columns', () => {
      const text = `
| Skill | A | B | C | D |
|-------|---|---|---|---|
| TypeScript | 5 | 4 | 3 | 5 |
`;
      const patterns = detectComparisonPatterns(text);

      expect(patterns).toHaveLength(1);
      expect(getComparisonData(patterns[0]).headers).toHaveLength(5);
    });

    it('should return empty for non-table text', () => {
      const text = 'Just regular text here.';
      const patterns = detectComparisonPatterns(text);

      expect(patterns).toHaveLength(0);
    });
  });

  describe('detectCapabilityPatterns', () => {
    it('should detect capability with requirements', () => {
      const text = `### Para Tech Lead
• React: 4
• TypeScript: 5
• Leadership: 3
`;
      const patterns = detectCapabilityPatterns(text);

      expect(patterns).toHaveLength(1);
      expect(patterns[0].type).toBe('capability');

      const data = getCapabilityData(patterns[0]);
      expect(data.name).toBe('Tech Lead');
      expect(data.requirements).toHaveLength(3);
    });

    it('should handle requirements with parentheses format', () => {
      const text = `### Senior Developer
- React (4)
- Node.js (3+)
`;
      const patterns = detectCapabilityPatterns(text);

      expect(patterns).toHaveLength(1);
      const data = getCapabilityData(patterns[0]);
      expect(data.requirements).toHaveLength(2);
      expect(data.requirements?.[0]).toEqual({ skill: 'React', level: 4 });
    });

    it('should handle capability without Para prefix', () => {
      const text = `## Full Stack Developer
• JavaScript: 4
`;
      const patterns = detectCapabilityPatterns(text);

      expect(patterns).toHaveLength(1);
      expect(getCapabilityData(patterns[0]).name).toBe('Full Stack Developer');
    });

    it('should handle quoted capability names', () => {
      const text = `### Para "DevOps Engineer"
• Kubernetes: 3
`;
      const patterns = detectCapabilityPatterns(text);

      expect(patterns).toHaveLength(1);
      expect(getCapabilityData(patterns[0]).name).toBe('DevOps Engineer');
    });
  });

  describe('detectCapabilityMentionPatterns', () => {
    it('should detect capability with role subtitle', () => {
      const text = '• **Tech Lead - Full Stack** Some description';
      const patterns = detectCapabilityMentionPatterns(text);

      expect(patterns).toHaveLength(1);
      expect(getCapabilityData(patterns[0]).name).toBe('Tech Lead - Full Stack');
    });

    it('should detect capability with status emoji', () => {
      const text = '**GenAI Developer** 🟡 Ideal para tu perfil';
      const patterns = detectCapabilityMentionPatterns(text);

      expect(patterns).toHaveLength(1);
      expect(getCapabilityData(patterns[0]).name).toBe('GenAI Developer');
    });

    it('should detect capability with red status emoji', () => {
      const text = '**Senior Architect** 🔴 Necesitas mejorar';
      const patterns = detectCapabilityMentionPatterns(text);

      expect(patterns).toHaveLength(1);
      expect(getCapabilityData(patterns[0]).name).toBe('Senior Architect');
    });

    it('should detect capability with green status emoji', () => {
      const text = '**Junior Developer** 🟢 Ya cumples los requisitos';
      const patterns = detectCapabilityMentionPatterns(text);

      expect(patterns).toHaveLength(1);
      expect(getCapabilityData(patterns[0]).name).toBe('Junior Developer');
    });

    it('should ignore short names', () => {
      const text = '**Hi** 🟡 Something';
      const patterns = detectCapabilityMentionPatterns(text);

      expect(patterns).toHaveLength(0);
    });

    it('should ignore bold text without role pattern or emoji', () => {
      const text = '**Just Bold Text** without any special markers';
      const patterns = detectCapabilityMentionPatterns(text);

      expect(patterns).toHaveLength(0);
    });
  });

  describe('detectAllPatterns', () => {
    it('should combine all pattern types', () => {
      const text = `
Here are some people:
• **Alice** - Frontend
• **Bob** - Backend

Skills needed:
• React (4), TypeScript (5)
`;
      const patterns = detectAllPatterns(text);

      // Should find persons and skill lists
      const personPatterns = patterns.filter((p) => p.type === 'person');
      const skillPatterns = patterns.filter((p) => p.type === 'skill_list');

      expect(personPatterns.length).toBeGreaterThan(0);
      expect(skillPatterns.length).toBeGreaterThan(0);
    });

    it('should sort patterns by start index', () => {
      const text = '• **Alice** - Design\n• React (4)';
      const patterns = detectAllPatterns(text);

      for (let i = 1; i < patterns.length; i++) {
        expect(patterns[i].startIndex).toBeGreaterThanOrEqual(patterns[i - 1].startIndex);
      }
    });

    it('should remove overlapping patterns', () => {
      // If a person pattern includes skills in the same line, don't duplicate
      const text = '• **Alice** - Design';
      const patterns = detectAllPatterns(text);

      // Check that no patterns overlap
      for (let i = 1; i < patterns.length; i++) {
        expect(patterns[i].startIndex).toBeGreaterThanOrEqual(patterns[i - 1].endIndex);
      }
    });

    it('should return empty array for plain text', () => {
      const text = 'This is just regular text without any special patterns.';
      const patterns = detectAllPatterns(text);

      expect(patterns).toHaveLength(0);
    });
  });

  describe('hasGenUIPatterns', () => {
    it('should return true for text with comparison patterns', () => {
      const text = `
| Skill | A | B |
|-------|---|---|
| React | 4 | 5 |
`;
      expect(hasGenUIPatterns(text)).toBe(true);
    });

    it('should return true for text with capability patterns', () => {
      const text = `### Para Developer
• React: 4
`;
      expect(hasGenUIPatterns(text)).toBe(true);
    });

    it('should return true for text with person patterns', () => {
      const text = '• **John Doe** - Engineering';
      expect(hasGenUIPatterns(text)).toBe(true);
    });

    it('should return true for text with capability mention patterns', () => {
      const text = '**Tech Lead - Full Stack** 🟡 Great match!';
      expect(hasGenUIPatterns(text)).toBe(true);
    });

    it('should return false for plain text', () => {
      const text = 'This is just regular text.';
      expect(hasGenUIPatterns(text)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(hasGenUIPatterns('')).toBe(false);
    });
  });
});
