/**
 * Pattern Detectors for AI Responses
 *
 * Detects structured data patterns in AI-generated text to enable
 * rich UI rendering (GenUI).
 */

// ============================================================================
// TYPES
// ============================================================================

export interface DetectedPerson {
  name: string;
  department?: string;
  skills?: Array<{ name: string; level: number }>;
  raw: string;
}

export interface DetectedSkill {
  name: string;
  level?: number;
  raw: string;
}

export interface DetectedComparison {
  headers: string[];
  rows: Array<{ skill: string; values: string[] }>;
  raw: string;
}

export interface DetectedCapability {
  name: string;
  requirements?: Array<{ skill: string; level: number }>;
  raw: string;
}

export type DetectedPattern =
  | { type: 'person'; data: DetectedPerson; startIndex: number; endIndex: number }
  | { type: 'skill_list'; data: DetectedSkill[]; startIndex: number; endIndex: number }
  | { type: 'comparison'; data: DetectedComparison; startIndex: number; endIndex: number }
  | { type: 'capability'; data: DetectedCapability; startIndex: number; endIndex: number };

// ============================================================================
// PATTERN DETECTORS
// ============================================================================

/**
 * Detects person mentions in AI responses
 * Pattern: "• **Name** - Department" or "**Name** - Department"
 */
export function detectPersonPatterns(text: string): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  // Pattern: "• **Name** - Department\n  Skills: ..."
  const personRegex = /[•\-]\s*\*\*([^*]+)\*\*\s*-\s*([^\n]+)(?:\n\s*Skills?:\s*([^\n]+))?/g;

  let match;
  while ((match = personRegex.exec(text)) !== null) {
    const name = match[1].trim();
    const department = match[2].trim();
    const skillsStr = match[3];

    let skills: Array<{ name: string; level: number }> | undefined;
    if (skillsStr) {
      // Parse skills like "React (4), TypeScript (5)"
      const skillMatches = skillsStr.matchAll(/([^,()]+)\s*\((\d+)\)/g);
      skills = Array.from(skillMatches).map((m) => ({
        name: m[1].trim(),
        level: parseInt(m[2], 10),
      }));
    }

    patterns.push({
      type: 'person',
      data: { name, department, skills, raw: match[0] },
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return patterns;
}

/**
 * Detects skill lists in AI responses
 * Pattern: "• Skill1 (4), Skill2 (5)" or list of skills with levels
 */
export function detectSkillListPatterns(text: string): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  // Pattern: Skills listed with levels in parentheses
  const skillLineRegex = /^[•\-]\s*(.+\(\d+\).*)$/gm;

  let match;
  while ((match = skillLineRegex.exec(text)) !== null) {
    const line = match[1];
    const skillMatches = line.matchAll(/([^,()]+)\s*\((\d+)\)/g);
    const skills: DetectedSkill[] = Array.from(skillMatches).map((m) => ({
      name: m[1].trim(),
      level: parseInt(m[2], 10),
      raw: m[0],
    }));

    if (skills.length > 0) {
      patterns.push({
        type: 'skill_list',
        data: skills,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }
  }

  return patterns;
}

/**
 * Detects comparison tables in AI responses
 * Pattern: Markdown table with | separators
 */
export function detectComparisonPatterns(text: string): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  // Pattern: Markdown table
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
          skill: cells[0] || '',
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
 * Detects capability requirements in AI responses
 * Pattern: "### Para [Capability]" followed by requirements list
 */
export function detectCapabilityPatterns(text: string): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  // Pattern: "### Para [Capability Name]" or "## [Capability Name]"
  const capabilityRegex = /###?\s*(?:Para\s+)?["']?([^"\n]+?)["']?\n+((?:[•\-]\s*.+\n?)+)/g;

  let match;
  while ((match = capabilityRegex.exec(text)) !== null) {
    const name = match[1].trim();
    const requirementsText = match[2];

    // Parse requirements
    const reqMatches = requirementsText.matchAll(/[•\-]\s*([^:(\n]+)(?::\s*(\d+)|\s*\((\d+)\+?\))?/g);
    const requirements = Array.from(reqMatches)
      .map((m) => ({
        skill: m[1].trim(),
        level: parseInt(m[2] || m[3] || '0', 10),
      }))
      .filter((r) => r.level > 0);

    patterns.push({
      type: 'capability',
      data: { name, requirements: requirements.length > 0 ? requirements : undefined, raw: match[0] },
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return patterns;
}

/**
 * Detects inline capability/role mentions in AI responses.
 * More flexible than detectCapabilityPatterns: matches lines like
 * "**Tech Lead - Full Stack** 🟡 Ideal para..." or "**GenAI Application Developer** 🔴 Podrías..."
 * so that we can render them as GenUI (link/chip or card) even when no tool was called.
 * Only treats as capability when: bold contains " - " (role - subtitle) OR line has status emoji (🟡🔴🟢) after bold.
 */
export function detectCapabilityMentionPatterns(text: string): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  // Match a line with **Capability Name** then optional emoji + rest of line.
  const mentionRegex = /^\s*(?:[•\-]\s*)?\*\*([^*]+)\*\*\s*([🟡🔴🟢])?\s*[^\n]*$/gm;

  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    const name = match[1].trim();
    const emoji = match[2];
    const hasRoleSubtitle = name.includes(' - ');
    const hasStatusEmoji = Boolean(emoji);
    // Only treat as capability if it looks like a role/capability: "Role - Subtitle" or "Name" followed by 🟡/🔴/🟢
    if (name.length < 3) continue;
    if (!hasRoleSubtitle && !hasStatusEmoji) continue;
    patterns.push({
      type: 'capability',
      data: { name, requirements: undefined, raw: match[0] },
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
    ...detectCapabilityPatterns(text),
    ...detectCapabilityMentionPatterns(text),
    ...detectPersonPatterns(text),
    ...detectSkillListPatterns(text),
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
    detectCapabilityPatterns(text).length > 0 ||
    detectCapabilityMentionPatterns(text).length > 0 ||
    detectPersonPatterns(text).length > 0
  );
}
