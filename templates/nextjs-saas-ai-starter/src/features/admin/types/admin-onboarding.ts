/**
 * Admin Person Onboarding Types
 *
 * Types for the admin wizard that allows onboarding persons with evidence uploads.
 */

import type { TenantRole } from '@/shared/db/schema/auth';

// ============================================================================
// WIZARD STEPS
// ============================================================================

export type AdminOnboardingStep = 'lookup' | 'setup' | 'upload' | 'review';

// ============================================================================
// EMAIL LOOKUP
// ============================================================================

export interface PersonLookupInput {
  email: string;
}

export interface PersonLookupData {
  userExists: boolean;
  personExists: boolean;
  user?: {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
  };
  person?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    title: string | null;
    department: string | null;
    status: 'active' | 'inactive' | 'onboarding';
    profileInitialized: boolean | null;
  };
  membership?: {
    id: string;
    role: TenantRole;
  };
}

export interface PersonLookupResult {
  success: boolean;
  data?: PersonLookupData;
  error?: string;
}

// ============================================================================
// PERSON SETUP
// ============================================================================

export type PersonSetupAction =
  | 'continue' // Person exists, continue to upload
  | 'create_person' // Create person directly without user
  | 'create_invite' // Create invitation for person to join
  | 'create_membership'; // User exists but no membership, create both

export interface CreatePersonDirectlyInput {
  email: string;
  firstName: string;
  lastName: string;
  title?: string;
  department?: string;
}

export interface CreatePersonDirectlyResult {
  success: boolean;
  data?: {
    personId: string;
    firstName: string;
    lastName: string;
  };
  error?: string;
}

export interface CreateMembershipWithPersonInput {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: TenantRole;
}

export interface CreateMembershipWithPersonResult {
  success: boolean;
  data?: {
    personId: string;
    membershipId: string;
  };
  error?: string;
}

// ============================================================================
// EVIDENCE UPLOAD
// ============================================================================

export interface UploadEvidenceInput {
  personId: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
}

export interface UploadEvidenceResult {
  success: boolean;
  uploadUrl?: string;
  fileObjectId?: string;
  jobId?: string;
  error?: string;
}

export interface UploadedEvidence {
  id: string;
  fileObjectId: string;
  jobId: string;
  filename: string;
  sizeBytes: number;
  uploadProgress: number; // 0-100
  status: 'pending' | 'uploading' | 'queued' | 'processing' | 'done' | 'failed';
  error?: string;
  extractedSkillsCount?: number;
}

// ============================================================================
// PROCESSING & REVIEW
// ============================================================================

export interface ProcessingJobStatus {
  id: string;
  status: 'queued' | 'processing' | 'done' | 'failed';
  error: string | null;
  metadata: {
    extractedSkillsCount?: number;
    matchedCount?: number;
    createdCount?: number;
    pendingCount?: number;
    skippedCount?: number;
  } | null;
  createdAt: string;
  finishedAt: string | null;
  file: {
    id: string;
    name: string | null;
    sizeBytes: number;
  };
}

export interface GetPersonJobsResult {
  success: boolean;
  data?: {
    jobs: ProcessingJobStatus[];
    person: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  error?: string;
}

export interface ExtractedSkillForReview {
  name: string;
  category: string;
  confidence: number;
  context?: string;
}

export interface GetJobSkillsResult {
  success: boolean;
  data?: {
    skills: ExtractedSkillForReview[];
  };
  error?: string;
}

// ============================================================================
// WIZARD STATE
// ============================================================================

export interface AdminOnboardingState {
  step: AdminOnboardingStep;
  email: string;
  lookupResult: PersonLookupData | null;
  selectedAction: PersonSetupAction | null;
  personId: string | null;
  evidences: UploadedEvidence[];
  isLoading: boolean;
  error: string | null;
}
