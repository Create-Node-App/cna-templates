/**
 * Pattern Detectors for AI Responses
 *
 * Detects structured data patterns in AI-generated text to enable
 * rich UI rendering (GenUI). These detectors are domain-agnostic —
 * they look for common markdown formatting patterns (bold names,
 * bullet lists with numeric values, tables, headings with criteria).
 */

// ============================================================================
// TYPES
// ============================================================================

export interface DetectedEntity {
  name: string;
  category?: string;
  attributes?: Array<{ name: string; level: number }>;
  raw: string;
}

export interface DetectedAttribute {
  name: string;
  level?: number;
  raw: string;
}

export interface DetectedComparison {
  headers: string[];
  rows: Array<{ label: string; values: string[] }>;
  raw: string;
}

export interface DetectedProfile {
  name: string;
  criteria?: Array<{ attribute: string; level: number }>;
  raw: string;
}

export type DetectedPattern =
  | { type: 'entity'; data: DetectedEntity; startIndex: number; endIndex: number }
  | { type: 'attribute_list'; data: DetectedAttribute[]; startIndex: number; endIndex: number }
  | { type: 'comparison'; data: DetectedComparison; startIndex: number; endIndex: number }
  | { type: 'profile'; data: DetectedProfile; startIndex: number; endIndex: number };

// ============================================================================
// PATTERN DETECTORS
// ============================================================================

/**
 * Detects entity mentions in AI responses.
 * Pattern: "• **Name** - Category" or "- **Name** - Category"
 * Optionally followed by attribute line: "  Attributes: Item1 (4), Item2 (5)"
 */
export function detectEntityPatterns(text: string): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  const entityRegex = /[•\-]\s*\*\*([^*]+)\*\*\s*-\s*([^\n]+)(?:\n\s*(?:Skills?|Attributes?|Tags?):\s*([^\n]+))?/g;

  let match;
  while ((match = entityRegex.exec(text)) !== null) {
    const name = match[1].trim();
    const category = match[2].trim();
    const attributesStr = match[3];

    let attributes: Array<{ name: string; level: number }> | undefined;
    if (attributesStr) {
      const attrMatches = attributesStr.matchAll(/([^,()]+)\s*\((\d+)\)/g);
      attributes = Array.from(attrMatches).map((m) => ({
        name: m[1].trim(),
        level: parseInt(m[2], 10),
      }));
    }

    patterns.push({
      type: 'entity',
      data: { name, category, attributes, raw: match[0] },
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return patterns;
}

/**
 * Detects attribute lists in AI responses.
 * Pattern: "• Item1 (4), Item2 (5)" or list of items with numeric levels in parentheses
 */
export function detectAttributeListPatterns(text: string): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  const attrLineRegex = /^[•\-]\s*(.+\(\d+\).*)$/gm;

  let match;
  while ((match = attrLineRegex.exec(text)) !== null) {
    const line = match[1];
    const attrMatches = line.matchAll(/([^,()]+)\s*\((\d+)\)/g);
    const attributes: DetectedAttribute[] = Array.from(attrMatches).map((m) => ({
      name: m[1].trim(),
      level: parseInt(m[2], 10),
      raw: m[0],
    }));

    if (attributes.length > 0) {
      patterns.push({
        type: 'attribute_list',
        data: attributes,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }
  }

  return patterns;
}

/**
 * Detects comparison tables in AI responses.
 * Pattern: Markdown table with | separators (requires at least 3 columns)
 */
export function detectComparisonPatterns(text: string): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  const tableRegex = /(\|[^\n]+\|\n\|[-|\s]+\|\n(?:\|[^\n]+\|\n?)+)/g;

  let match;
  while ((match = tableRegex.exec(text)) !== null) {
    const tableText = match[1];
    const lines = tableText
      .trim()
      .split('\n')
      .filter((line) => !line.match(/^\|[-|\s]+\|$/));

    if (lines.length >= 2) {
      const headers = lines[0]
        .split('|')
        .filter((h) => h.trim())
        .map((h) => h.trim());
      const rows = lines.slice(1).map((line) => {
        const cells = line
          .split('|')
          .filter((c) => c.trim())
          .map((c) => c.trim());
        return {
          label: cells[0] || '',
          values: cells.slice(1),
        };
      });

      // Check if this looks like a comparison (has at least 2 value columns)
      if (headers.length >= 3) {
        patterns.push({
          type: 'comparison',
          data: { headers, rows, raw: match[0] },
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    }
  }

  return patterns;
}

/**
 * Detects profile/role definitions in AI responses.
 * Pattern: "### [Profile Name]" or "### Para [Profile Name]" followed by criteria list
 */
export function detectProfilePatterns(text: string): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  const profileRegex = /###?\s*(?:Para\s+)?["']?([^"\n]+?)["']?\n+((?:[•\-]\s*.+\n?)+)/g;

  let match;
  while ((match = profileRegex.exec(text)) !== null) {
    const name = match[1].trim();
    const criteriaText = match[2];

    const criteriaMatches = criteriaText.matchAll(/[•\-]\s*([^:(\n]+)(?::\s*(\d+)|\s*\((\d+)\+?\))?/g);
    const criteria = Array.from(criteriaMatches)
      .map((m) => ({
        attribute: m[1].trim(),
        level: parseInt(m[2] || m[3] || '0', 10),
      }))
      .filter((r) => r.level > 0);

    patterns.push({
      type: 'profile',
      data: { name, criteria: criteria.length > 0 ? criteria : undefined, raw: match[0] },
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return patterns;
}

/**
 * Detects inline profile/role mentions in AI responses.
 * Matches lines like "**Tech Lead - Full Stack** 🟡 Great match!" or "**Role Name** 🔴 Description"
 * Only treats as profile when: bold contains " - " (role - subtitle) OR line has status emoji after bold.
 */
export function detectProfileMentionPatterns(text: string): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  const mentionRegex = /^\s*(?:[•\-]\s*)?\*\*([^*]+)\*\*\s*([🟡🔴🟢])?\s*[^\n]*$/gm;

  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    const name = match[1].trim();
    const emoji = match[2];
    const hasRoleSubtitle = name.includes(' - ');
    const hasStatusEmoji = Boolean(emoji);

    if (name.length < 3) continue;
    if (!hasRoleSubtitle && !hasStatusEmoji) continue;

    patterns.push({
      type: 'profile',
      data: { name, criteria: undefined, raw: match[0] },
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return patterns;
}

/**
 * Detects all patterns in a text.
 * Used as fallback for messages that don't have tool parts (e.g. plain-text or older format).
 * Tool parts take precedence; pattern detection only runs on text-only content.
 */
export function detectAllPatterns(text: string): DetectedPattern[] {
  const allPatterns: DetectedPattern[] = [
    ...detectComparisonPatterns(text),
    ...detectProfilePatterns(text),
    ...detectProfileMentionPatterns(text),
    ...detectEntityPatterns(text),
    ...detectAttributeListPatterns(text),
  ];

  // Sort by start index and remove overlapping patterns (keep the first/larger one)
  allPatterns.sort((a, b) => a.startIndex - b.startIndex);

  const nonOverlapping: DetectedPattern[] = [];
  let lastEnd = -1;

  for (const pattern of allPatterns) {
    if (pattern.startIndex >= lastEnd) {
      nonOverlapping.push(pattern);
      lastEnd = pattern.endIndex;
    }
  }

  return nonOverlapping;
}

/**
 * Check if text contains any GenUI-renderable patterns
 */
export function hasGenUIPatterns(text: string): boolean {
  return (
    detectComparisonPatterns(text).length > 0 ||
    detectProfilePatterns(text).length > 0 ||
    detectProfileMentionPatterns(text).length > 0 ||
    detectEntityPatterns(text).length > 0
  );
}
