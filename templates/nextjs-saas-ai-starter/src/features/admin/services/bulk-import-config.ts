/**
 * Bulk Import Configuration
 *
 * Types and configuration for bulk import functionality.
 * This file does NOT have 'use server' so it can export objects.
 */

// ============================================================================
// Types
// ============================================================================

export type BulkImportEntity = 'skills' | 'persons' | 'capabilities';

export interface BulkImportColumn {
  name: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'email' | 'date';
  description: string;
}

export interface BulkImportConfig {
  entity: BulkImportEntity;
  columns: BulkImportColumn[];
  uniqueKey: string;
  label: string;
}

export interface ParsedRow {
  rowNumber: number;
  data: Record<string, unknown>;
  isValid: boolean;
  errors: string[];
  isDuplicate?: boolean;
}

export interface BulkImportPreview {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  rows: ParsedRow[];
  columns: string[];
}

export interface BulkImportResult {
  success: boolean;
  totalProcessed: number;
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: number; message: string }>;
}

// ============================================================================
// Entity Configurations
// ============================================================================

export const IMPORT_CONFIGS: Record<BulkImportEntity, BulkImportConfig> = {
  skills: {
    entity: 'skills',
    label: 'Skills',
    uniqueKey: 'name',
    columns: [
      { name: 'name', required: true, type: 'string', description: 'Skill name' },
      { name: 'description', required: false, type: 'string', description: 'Skill description' },
      { name: 'category', required: false, type: 'string', description: 'Category (technical, soft, domain)' },
    ],
  },
  persons: {
    entity: 'persons',
    label: 'Team Members',
    uniqueKey: 'email',
    columns: [
      { name: 'email', required: true, type: 'email', description: 'Email address' },
      { name: 'firstName', required: true, type: 'string', description: 'First name' },
      { name: 'lastName', required: true, type: 'string', description: 'Last name' },
      { name: 'displayName', required: false, type: 'string', description: 'Display name' },
      { name: 'title', required: false, type: 'string', description: 'Job title' },
      { name: 'department', required: false, type: 'string', description: 'Department' },
    ],
  },
  capabilities: {
    entity: 'capabilities',
    label: 'Capabilities',
    uniqueKey: 'name',
    columns: [
      { name: 'name', required: true, type: 'string', description: 'Capability name' },
      { name: 'description', required: false, type: 'string', description: 'Description' },
    ],
  },
};
