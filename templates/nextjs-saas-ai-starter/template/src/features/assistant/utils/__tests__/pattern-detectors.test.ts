/**
 * Tests for Pattern Detectors
 */

import {
  detectAllPatterns,
  detectAttributeListPatterns,
  detectComparisonPatterns,
  type DetectedAttribute,
  type DetectedComparison,
  type DetectedEntity,
  type DetectedPattern,
  type DetectedProfile,
  detectEntityPatterns,
  detectProfileMentionPatterns,
  detectProfilePatterns,
  hasGenUIPatterns,
} from '../pattern-detectors';

// ============================================================================
// TYPE GUARDS FOR TEST ASSERTIONS
// ============================================================================

type EntityPattern = Extract<DetectedPattern, { type: 'entity' }>;
type AttributeListPattern = Extract<DetectedPattern, { type: 'attribute_list' }>;
type ComparisonPattern = Extract<DetectedPattern, { type: 'comparison' }>;
type ProfilePattern = Extract<DetectedPattern, { type: 'profile' }>;

function assertEntityPattern(pattern: DetectedPattern): asserts pattern is EntityPattern {
  if (pattern.type !== 'entity') {
    throw new Error(`Expected entity pattern, got ${pattern.type}`);
  }
}

function assertAttributeListPattern(pattern: DetectedPattern): asserts pattern is AttributeListPattern {
  if (pattern.type !== 'attribute_list') {
    throw new Error(`Expected attribute_list pattern, got ${pattern.type}`);
  }
}

function assertComparisonPattern(pattern: DetectedPattern): asserts pattern is ComparisonPattern {
  if (pattern.type !== 'comparison') {
    throw new Error(`Expected comparison pattern, got ${pattern.type}`);
  }
}

function assertProfilePattern(pattern: DetectedPattern): asserts pattern is ProfilePattern {
  if (pattern.type !== 'profile') {
    throw new Error(`Expected profile pattern, got ${pattern.type}`);
  }
}

// Helper to get entity data with type safety
function getEntityData(pattern: DetectedPattern): DetectedEntity {
  assertEntityPattern(pattern);
  return pattern.data;
}

// Helper to get attribute list data with type safety
function getAttributeListData(pattern: DetectedPattern): DetectedAttribute[] {
  assertAttributeListPattern(pattern);
  return pattern.data;
}

// Helper to get comparison data with type safety
function getComparisonData(pattern: DetectedPattern): DetectedComparison {
  assertComparisonPattern(pattern);
  return pattern.data;
}

// Helper to get profile data with type safety
function getProfileData(pattern: DetectedPattern): DetectedProfile {
  assertProfilePattern(pattern);
  return pattern.data;
}

// ============================================================================
// TESTS
// ============================================================================

describe('Pattern Detectors', () => {
  describe('detectEntityPatterns', () => {
    it('should detect entity with category', () => {
      const text = '• **John Doe** - Engineering';
      const patterns = detectEntityPatterns(text);

      expect(patterns).toHaveLength(1);
      expect(patterns[0].type).toBe('entity');

      const data = getEntityData(patterns[0]);
      expect(data.name).toBe('John Doe');
      expect(data.category).toBe('Engineering');
    });

    it('should detect entity with attributes', () => {
      const text = '• **Jane Smith** - Design\n  Skills: React (4), TypeScript (5)';
      const patterns = detectEntityPatterns(text);

      expect(patterns).toHaveLength(1);
      const data = getEntityData(patterns[0]);
      expect(data.name).toBe('Jane Smith');
      expect(data.category).toBe('Design');
      expect(data.attributes).toHaveLength(2);
      expect(data.attributes?.[0]).toEqual({ name: 'React', level: 4 });
      expect(data.attributes?.[1]).toEqual({ name: 'TypeScript', level: 5 });
    });

    it('should detect multiple entities', () => {
      const text = '• **Alice** - Frontend\n• **Bob** - Backend';
      const patterns = detectEntityPatterns(text);

      expect(patterns).toHaveLength(2);
      expect(getEntityData(patterns[0]).name).toBe('Alice');
      expect(getEntityData(patterns[1]).name).toBe('Bob');
    });

    it('should handle dash bullet points', () => {
      const text = '- **Carlos** - DevOps';
      const patterns = detectEntityPatterns(text);

      expect(patterns).toHaveLength(1);
      expect(getEntityData(patterns[0]).name).toBe('Carlos');
    });

    it('should return empty array for no matches', () => {
      const text = 'This is just plain text without any patterns.';
      const patterns = detectEntityPatterns(text);

      expect(patterns).toHaveLength(0);
    });

    it('should capture start and end indices', () => {
      const text = 'Some text before • **Test Person** - Testing after';
      const patterns = detectEntityPatterns(text);

      expect(patterns).toHaveLength(1);
      expect(patterns[0].startIndex).toBeGreaterThan(0);
      expect(patterns[0].endIndex).toBeGreaterThan(patterns[0].startIndex);
    });
  });

  describe('detectAttributeListPatterns', () => {
    it('should detect attribute list with levels', () => {
      const text = '• React (4), TypeScript (5), Node.js (3)';
      const patterns = detectAttributeListPatterns(text);

      expect(patterns).toHaveLength(1);
      expect(patterns[0].type).toBe('attribute_list');

      const data = getAttributeListData(patterns[0]);
      expect(data).toHaveLength(3);
      expect(data[0]).toEqual({ name: 'React', level: 4, raw: 'React (4)' });
    });

    it('should handle multiple attribute lines', () => {
      const text = '• JavaScript (4)\n• Python (3)\n• Go (2)';
      const patterns = detectAttributeListPatterns(text);

      expect(patterns).toHaveLength(3);
    });

    it('should ignore lines without attributes in parentheses', () => {
      const text = '• This is just a bullet point without attributes';
      const patterns = detectAttributeListPatterns(text);

      expect(patterns).toHaveLength(0);
    });

    it('should handle dash bullet points', () => {
      const text = '- Java (4), Kotlin (3)';
      const patterns = detectAttributeListPatterns(text);

      expect(patterns).toHaveLength(1);
      expect(getAttributeListData(patterns[0])).toHaveLength(2);
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
      expect(data.rows[0]).toEqual({ label: 'React', values: ['4', '5'] });
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

  describe('detectProfilePatterns', () => {
    it('should detect profile with criteria', () => {
      const text = `### Para Tech Lead
• React: 4
• TypeScript: 5
• Leadership: 3
`;
      const patterns = detectProfilePatterns(text);

      expect(patterns).toHaveLength(1);
      expect(patterns[0].type).toBe('profile');

      const data = getProfileData(patterns[0]);
      expect(data.name).toBe('Tech Lead');
      expect(data.criteria).toHaveLength(3);
    });

    it('should handle criteria with parentheses format', () => {
      const text = `### Senior Developer
- React (4)
- Node.js (3+)
`;
      const patterns = detectProfilePatterns(text);

      expect(patterns).toHaveLength(1);
      const data = getProfileData(patterns[0]);
      expect(data.criteria).toHaveLength(2);
      expect(data.criteria?.[0]).toEqual({ attribute: 'React', level: 4 });
    });

    it('should handle profile without Para prefix', () => {
      const text = `## Full Stack Developer
• JavaScript: 4
`;
      const patterns = detectProfilePatterns(text);

      expect(patterns).toHaveLength(1);
      expect(getProfileData(patterns[0]).name).toBe('Full Stack Developer');
    });

    it('should handle quoted profile names', () => {
      const text = `### Para "DevOps Engineer"
• Kubernetes: 3
`;
      const patterns = detectProfilePatterns(text);

      expect(patterns).toHaveLength(1);
      expect(getProfileData(patterns[0]).name).toBe('DevOps Engineer');
    });
  });

  describe('detectProfileMentionPatterns', () => {
    it('should detect profile with role subtitle', () => {
      const text = '• **Tech Lead - Full Stack** Some description';
      const patterns = detectProfileMentionPatterns(text);

      expect(patterns).toHaveLength(1);
      expect(getProfileData(patterns[0]).name).toBe('Tech Lead - Full Stack');
    });

    it('should detect profile with status emoji', () => {
      const text = '**GenAI Developer** 🟡 Ideal para tu perfil';
      const patterns = detectProfileMentionPatterns(text);

      expect(patterns).toHaveLength(1);
      expect(getProfileData(patterns[0]).name).toBe('GenAI Developer');
    });

    it('should detect profile with red status emoji', () => {
      const text = '**Senior Architect** 🔴 Necesitas mejorar';
      const patterns = detectProfileMentionPatterns(text);

      expect(patterns).toHaveLength(1);
      expect(getProfileData(patterns[0]).name).toBe('Senior Architect');
    });

    it('should detect profile with green status emoji', () => {
      const text = '**Junior Developer** 🟢 Ya cumples los requisitos';
      const patterns = detectProfileMentionPatterns(text);

      expect(patterns).toHaveLength(1);
      expect(getProfileData(patterns[0]).name).toBe('Junior Developer');
    });

    it('should ignore short names', () => {
      const text = '**Hi** 🟡 Something';
      const patterns = detectProfileMentionPatterns(text);

      expect(patterns).toHaveLength(0);
    });

    it('should ignore bold text without role pattern or emoji', () => {
      const text = '**Just Bold Text** without any special markers';
      const patterns = detectProfileMentionPatterns(text);

      expect(patterns).toHaveLength(0);
    });
  });

  describe('detectAllPatterns', () => {
    it('should combine all pattern types', () => {
      const text = `
Here are some entities:
• **Alice** - Frontend
• **Bob** - Backend

Attributes needed:
• React (4), TypeScript (5)
`;
      const patterns = detectAllPatterns(text);

      // Should find entities and attribute lists
      const entityPatterns = patterns.filter((p) => p.type === 'entity');
      const attributePatterns = patterns.filter((p) => p.type === 'attribute_list');

      expect(entityPatterns.length).toBeGreaterThan(0);
      expect(attributePatterns.length).toBeGreaterThan(0);
    });

    it('should sort patterns by start index', () => {
      const text = '• **Alice** - Design\n• React (4)';
      const patterns = detectAllPatterns(text);

      for (let i = 1; i < patterns.length; i++) {
        expect(patterns[i].startIndex).toBeGreaterThanOrEqual(patterns[i - 1].startIndex);
      }
    });

    it('should remove overlapping patterns', () => {
      // If an entity pattern includes attributes in the same line, don't duplicate
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

    it('should return true for text with profile patterns', () => {
      const text = `### Para Developer
• React: 4
`;
      expect(hasGenUIPatterns(text)).toBe(true);
    });

    it('should return true for text with entity patterns', () => {
      const text = '• **John Doe** - Engineering';
      expect(hasGenUIPatterns(text)).toBe(true);
    });

    it('should return true for text with profile mention patterns', () => {
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
