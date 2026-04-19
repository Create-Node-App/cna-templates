import type { Meta, StoryObj } from '@storybook/react';
import { ToolPartRenderer } from './ToolPartRenderer';

const meta: Meta<typeof ToolPartRenderer> = {
  title: 'Assistant/ToolPartRenderer',
  component: ToolPartRenderer,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    partType: { control: 'text' },
    partState: { control: 'select', options: ['input-available', 'output-available', 'output-error'] },
    tenantSlug: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof ToolPartRenderer>;

export const Loading: Story = {
  args: {
    partType: 'tool-searchEntities',
    partState: 'input-available',
    partOutput: undefined,
    tenantSlug: 'demo',
  },
};

export const Error: Story = {
  args: {
    partType: 'tool-searchEntities',
    partState: 'output-error',
    partOutput: undefined,
    partErrorText: 'Failed to search entities.',
    tenantSlug: 'demo',
  },
};

const searchEntitiesOutput = {
  summary: 'Found 2 entities with React attributes.',
  items: [
    {
      entityId: 'entity-1',
      name: 'Jane Doe',
      category: 'Engineering',
      attributes: [
        { name: 'React', level: 4 },
        { name: 'TypeScript', level: 5 },
      ],
    },
    {
      entityId: 'entity-2',
      name: 'John Smith',
      category: 'Product',
      attributes: [
        { name: 'React', level: 3 },
        { name: 'Node.js', level: 4 },
      ],
    },
  ],
};

export const SearchEntitiesOutput: Story = {
  args: {
    partType: 'tool-searchEntities',
    partState: 'output-available',
    partOutput: searchEntitiesOutput,
    tenantSlug: 'demo',
  },
};

const searchKnowledgeOutput = {
  summary: 'Found 2 documents.',
  documents: [
    { id: 'doc-1', slug: 'react-basics', title: 'React Basics', docType: 'Guide' },
    { id: 'doc-2', slug: 'typescript-handbook', title: 'TypeScript Handbook', docType: 'Reference' },
  ],
};

export const SearchKnowledgeOutput: Story = {
  args: {
    partType: 'tool-searchKnowledge',
    partState: 'output-available',
    partOutput: searchKnowledgeOutput,
    tenantSlug: 'demo',
  },
};
