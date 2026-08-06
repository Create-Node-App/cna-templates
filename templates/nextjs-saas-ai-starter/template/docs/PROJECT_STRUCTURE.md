# 🗄️ Project Structure

The Next.js SaaS AI Template follows a Feature-Based Architecture adapted for Next.js App Router, combining the best practices of modular architecture with Next.js conventions. The main goal is to organize code around business capabilities while leveraging Next.js's powerful routing and server components.

## Architecture Overview

The codebase is organized into three main categories:

1. **App Router** (`src/app/`) - Next.js routing, layouts, and API routes
2. **Features** (`src/features/`) - Business capabilities (auth, skills, assessments, etc.)
3. **Shared Infrastructure** (`src/shared/`) - Common utilities, components, database, and contexts

### Directory Structure

```
src/
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Auth group route
│   │   ├── login/page.tsx         # Login page
│   │   └── select-tenant/         # Tenant selection page
│   │
│   ├── (tenant)/                  # Tenant-scoped routes
│   │   └── t/[tenant]/            # Dynamic tenant segment
│   │       ├── layout.tsx         # Tenant layout with validation
│   │       ├── page.tsx           # Tenant dashboard
│   │       ├── error.tsx          # Error boundary
│   │       ├── loading.tsx        # Loading state
│   │       ├── admin/             # Admin panel routes
│   │       │   ├── skills/        # Skill management
│   │       │   ├── members/       # Member management
│   │       │   ├── invites/       # Invitation management
│   │       │   ├── capabilities/  # Capability management
│   │       │   ├── knowledge/     # Knowledge docs management
│   │       │   ├── settings/      # Tenant settings
│   │       │   └── processing/    # CV processing dashboard
│   │       ├── profile/           # User profile
│   │       ├── team/              # Team directory
│   │       ├── people/            # People finder
│   │       ├── knowledge/         # Knowledge base
│   │       ├── assistant/         # AI assistant
│   │       ├── self-assessment/   # Skill self-assessment
│   │       ├── growth/            # Growth suggestions
│   │       ├── onboarding/        # Onboarding flow
│   │       └── invite/[token]/    # Invitation acceptance
│   │
│   ├── api/                       # API routes
│   │   ├── auth/[...nextauth]/    # Auth.js handlers
│   │   ├── chat/                  # AI chat endpoint
│   │   ├── health/                # Health check endpoint
│   │   └── tenants/[tenant]/      # Tenant-scoped APIs
│   │       ├── skills/            # Skills API
│   │       ├── profile/           # Profile APIs (evidences, interests)
│   │       ├── settings/          # Settings API
│   │       └── admin/             # Admin APIs
│   │
│   ├── globals.css                # Global styles (Tailwind v4)
│   ├── layout.tsx                 # Root layout with providers
│   └── page.tsx                   # Landing page
│
├── features/                      # Feature modules
│   ├── admin/                     # Admin panel feature
│   │   ├── components/            # AdminDataTable, SkillsClient, MembersClient, etc.
│   │   ├── services/              # Server actions for admin operations
│   │   ├── types/                 # Admin types
│   │   └── index.ts               # Public API
│   │
│   ├── assistant/                 # AI assistant feature
│   │   ├── components/            # ChatInterface
│   │   ├── types/                 # Chat types
│   │   └── index.ts
│   │
│   ├── auth/                      # Authentication feature
│   │   ├── components/            # LoginForm, TenantLoginForm
│   │   ├── hooks/                 # useAuth hook
│   │   ├── services/              # Server-side auth utilities
│   │   └── index.ts
│   │
│   ├── dashboard/                 # Dashboard feature
│   │   ├── actions/               # getDashboardStats, getGrowthSuggestions
│   │   ├── components/            # DashboardStats, QuickActions
│   │   ├── types/                 # Dashboard types
│   │   └── index.ts
│   │
│   ├── evidence/                  # Evidence management feature
│   │   ├── components/            # EvidenceCard, EvidenceUpload, SkillReviewPanel
│   │   ├── services/              # Evidence processing
│   │   ├── types/                 # Evidence types
│   │   └── index.ts
│   │
│   ├── onboarding/                # Onboarding feature
│   │   ├── actions/               # uploadCV, confirmSkills, getJobStatus
│   │   ├── components/            # CVUploader, OnboardingProgress
│   │   ├── types/                 # Onboarding types
│   │   └── index.ts
│   │
│   ├── people-finder/             # People finder feature
│   │   ├── actions/               # searchPeopleByCapability
│   │   ├── components/            # CapabilitySearch, PersonCard
│   │   ├── types/                 # Search types
│   │   └── index.ts
│   │
│   ├── profile/                   # Profile feature
│   │   ├── components/            # ProfileClient, InterestsManager
│   │   ├── types/                 # Profile types
│   │   └── index.ts
│   │
│   ├── feedback/                  # Feedback feature
│   │   └── components/            # FeedbackList, GiveFeedbackModal
│   │
│   ├── growth/                    # Personal growth feature
│   │   └── components/            # GrowthDashboard, CapabilityGapAnalysis
│   │
│   ├── learning/                  # Learning management feature
│   │   ├── components/            # AssignmentList, TrainingProgressCard, LearningStatsCard
│   │   ├── services/              # Assignment tracking
│   │   └── types/
│   │
│   ├── manager/                   # Manager-specific feature
│   │   ├── components/            # CreateOneOnOneMeetingDialog, OneOnOneMeetingDetailClient, etc.
│   │   └── services/              # Manager team, assignments, analytics
│   │
│   ├── mentions/                  # @ mention system (rich text badges with hover previews)
│   │   ├── actions/               # search-entities, get-entity-preview
│   │   ├── types/                 # Mention types
│   │   └── utils/                 # parse-mentions
│   │
│   ├── okrs/                      # OKR management feature
│   │   ├── components/            # OKRList, ObjectiveCard, CheckInDialog, OKREditor
│   │   ├── services/              # okr-service (CRUD)
│   │   └── types/
│   │
│   ├── one-on-one/                # 1:1 meeting features (AI agenda, context aggregation)
│   │   ├── components/            # SuggestAgendaButton
│   │   └── services/              # person-context-service, agenda-suggestion-service
│   │
│   ├── performance/               # Performance assessments feature
│   │   ├── components/            # Assessment forms, charts, review cycle management
│   │   └── services/              # Assessment CRUD, review cycles
│   │
│   ├── recognitions/              # Recognitions (kudos) feature
│   │   └── components/            # RecognitionCard, RecognitionsList, SendRecognitionModal
│   │
│   └── _feature-template_/        # Template for new features
│
├── shared/                        # Shared infrastructure
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components (30+ components)
│   │   ├── providers/             # Context providers (AuthProvider, ThemeProvider)
│   │   ├── ProfileCompletionWidget.tsx
│   │   └── NavHeader.tsx
│   │
│   ├── contexts/                  # React contexts
│   │   └── tenant-context.tsx     # Multi-tenancy context
│   │
│   ├── db/                        # Database (Drizzle ORM)
│   │   ├── index.ts               # Database client (PostgreSQL + pgvector)
│   │   └── schema/                # Schema definitions
│   │       ├── tenants.ts         # Tenant and settings
│   │       ├── persons.ts         # Person profiles
│   │       ├── skills.ts          # Skills with pgvector embeddings
│   │       ├── assessments.ts     # Skill assessments
│   │       ├── interests.ts       # Interest signals
│   │       ├── capabilities.ts    # Capabilities and requirements
│   │       ├── evidences.ts       # Evidence records
│   │       ├── files.ts           # File objects and CV processing jobs
│   │       ├── knowledge.ts       # Knowledge documents
│   │       ├── invitations.ts     # Tenant invitations
│   │       ├── auth.ts            # Auth.js tables
│   │       └── audit.ts           # Audit events
│   │
│   ├── lib/                       # Shared utilities
│   │   ├── env.ts                 # Environment validation (Zod)
│   │   ├── auth.ts                # Auth.js v5 configuration
│   │   ├── tenant.ts              # Tenant utilities
│   │   ├── logger.ts              # Pino structured logger
│   │   ├── api-errors.ts          # API error handling
│   │   ├── rbac.ts                # Role-based access control
│   │   ├── tenant-settings.ts     # Tenant settings utilities
│   │   └── utils.ts               # cn() and helpers
│   │
│   └── services/                  # Shared services
│       ├── audit-service.ts       # Audit logging
│       ├── embedding-service.ts   # OpenAI embeddings + semantic search
│       └── s3-service.ts          # S3 presigned URLs
│
└── i18n/                          # Internationalization
    ├── messages/
    │   ├── en.json                # English translations
    │   └── es.json                # Spanish translations
    └── request.ts                 # i18n configuration
```

## Key Principles

1. **Feature Encapsulation**
   - Each feature is a self-contained module
   - Features should not depend on the internal structure of other features
   - All feature exports should go through the `index.ts` file

2. **Next.js Integration**
   - Use route groups (folders in parentheses) to organize related routes
   - Leverage server components for data fetching and server-side rendering
   - Keep page components thin, delegating logic to features

3. **Public API**
   - Features expose their functionality through a public API (`index.ts`)
   - Other parts of the application should only import from the feature's root:

   ```typescript
   // ✅ Good
   import { LoginForm } from '@/features/auth';

   // ❌ Bad
   import { LoginForm } from '@/features/auth/components/LoginForm';
   ```

4. **Import Rules**
   To enforce these principles, add the following ESLint rule:
   ```js
   {
       rules: {
           'no-restricted-imports': [
               'error',
               {
                   patterns: ['@/features/*/*'],
               },
           ],
       }
   }
   ```

## Best Practices

1. **Route Organization**
   - Use route groups to organize related routes
   - Keep page components focused on routing and layout
   - Delegate business logic to features
   - Add `error.tsx` and `loading.tsx` for better UX

2. **Feature Development**
   - Keep features focused on a single business capability
   - Minimize dependencies between features
   - Use the shared infrastructure for common functionality

3. **Server Components**
   - Use server components for data fetching and server-side rendering
   - Keep client components minimal and focused on interactivity
   - Leverage Next.js's built-in optimizations

4. **State Management**
   - Use React Server Components for server state
   - Use React Context for client state when needed (TenantProvider, AuthProvider)
   - Consider using libraries like Zustand for complex client state

5. **Data Fetching**
   - Use Next.js's built-in data fetching methods
   - Keep data fetching logic in server actions (`'use server'`)
   - Use React Query for client-side data fetching when needed

6. **Internationalization**
   - Use `next-intl` for translations
   - Keep translation keys organized by feature/component
   - Support both English (`en.json`) and Spanish (`es.json`)

7. **Accessibility**
   - Add ARIA attributes to forms and interactive components
   - Use semantic HTML elements
   - Ensure keyboard navigation works properly

## Example: Auth Feature

Here's how a typical feature might be structured:

```typescript
// features/auth/index.ts
export * from './components';
export * from './hooks';
export * from './services';
export * from './types';

// features/auth/components/LoginForm.tsx
import { useAuth } from '../hooks';
import { login } from '../services';

export const LoginForm = () => {
  const { login } = useAuth();
  // Component implementation
};

// app/(auth)/login/page.tsx
import { LoginForm } from '@/features/auth';

export default function LoginPage() {
  return (
    <div>
      <h1>Login</h1>
      <LoginForm />
    </div>
  );
}
```

## Benefits

1. **Maintainability**: Changes to a feature are isolated and don't affect other parts of the application
2. **Scalability**: New features can be added without modifying existing code
3. **Performance**: Leverages Next.js's built-in optimizations
4. **Developer Experience**: Clear organization and separation of concerns
5. **Type Safety**: Full TypeScript support throughout the application
