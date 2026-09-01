'use server';

import { and, eq } from 'drizzle-orm';

import { db } from '@/shared/db';
import { persons } from '@/shared/db/schema';
import { auth } from '@/shared/lib/auth';
import { getTenantBySlug } from '@/shared/lib/tenant';

/**
 * Get initial data for the assistant with dynamic questions based on user profile
 */
export async function getInitialData(tenantSlug: string) {
  const session = await auth();

  if (!session?.user?.id || !session?.user?.email) {
    throw new Error('Unauthorized');
  }

  const personName = session.user.name || 'User';
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  // Find person by email
  const person = await db.query.persons.findFirst({
    where: and(eq(persons.tenantId, tenant.id), eq(persons.email, session.user.email)),
  });

  const suggestedQuestions: Array<{
    id: string;
    text: string;
    category: 'general' | 'automation' | 'integrations';
  }> = [
    { id: '1', text: 'How can I automate this workflow?', category: 'automation' },
    { id: '2', text: 'What integrations are available?', category: 'integrations' },
    { id: '3', text: 'How do I set up a new agent?', category: 'general' },
    { id: '4', text: 'What can you help me with?', category: 'general' },
  ];

  return {
    welcomeMessage: `Hi ${person ? `${person.firstName} ${person.lastName}` : personName}! 👋 I'm your AI assistant. How can I help you today?`,
    suggestedQuestions: suggestedQuestions.slice(0, 4),
    capabilities: [
      {
        id: 'automation',
        name: 'Automation',
        description: 'Help you automate workflows and tasks',
        examples: ['How do I automate this?', 'Create a workflow for X'],
      },
      {
        id: 'integrations',
        name: 'Integrations',
        description: 'Connect and manage your integrations',
        examples: ['How do I connect GitHub?', 'List my active integrations'],
      },
      {
        id: 'general',
        name: 'General Help',
        description: 'Answer questions and provide guidance',
        examples: ['What can you do?', 'Help me understand X'],
      },
    ],
  };
}
