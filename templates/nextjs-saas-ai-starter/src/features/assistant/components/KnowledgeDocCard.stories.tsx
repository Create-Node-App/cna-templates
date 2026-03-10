import type { Meta, StoryObj } from '@storybook/react';
import { KnowledgeDocCard } from './KnowledgeDocCard';

const meta: Meta<typeof KnowledgeDocCard> = {
  title: 'Assistant/KnowledgeDocCard',
  component: KnowledgeDocCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    tenantSlug: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof KnowledgeDocCard>;

const documents = [
  { id: 'doc-1', slug: 'react-advanced-patterns', title: 'React Advanced Patterns', docType: 'training' },
  { id: 'doc-2', slug: 'backend-engineer', title: 'Backend Engineer Roadmap', docType: 'roadmap' },
  { id: 'doc-3', slug: 'tech-lead-fullstack', title: 'Tech Lead – Full Stack', docType: 'role_profile' },
  { id: 'doc-4', slug: 'aws-fundamentals', title: 'AWS Fundamentals', docType: 'training' },
  { id: 'doc-5', slug: 'frontend-developer', title: 'Frontend Developer Roadmap', docType: 'roadmap' },
];

export const Default: Story = {
  args: {
    documents,
  },
};

export const WithLinks: Story = {
  args: {
    documents,
    tenantSlug: 'demo',
  },
};

export const SingleDocument: Story = {
  args: {
    documents: [documents[0]],
    tenantSlug: 'demo',
  },
};
