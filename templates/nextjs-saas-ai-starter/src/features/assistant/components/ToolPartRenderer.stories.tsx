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
    partType: 'tool-searchPeople',
    partState: 'input-available',
    partOutput: undefined,
    tenantSlug: 'demo',
  },
};

export const Error: Story = {
  args: {
    partType: 'tool-searchPeople',
    partState: 'output-error',
    partOutput: undefined,
    partErrorText: 'Failed to search people.',
    tenantSlug: 'demo',
  },
};

const searchPeopleOutput = {
  summary: 'Found 2 people with React skills.',
  items: [
    {
      personId: 'person-1',
      name: 'Jane Doe',
      department: 'Engineering',
      skills: [
        { name: 'React', level: 4 },
        { name: 'TypeScript', level: 5 },
      ],
    },
    {
      personId: 'person-2',
      name: 'John Smith',
      department: 'Product',
      skills: [
        { name: 'React', level: 3 },
        { name: 'Node.js', level: 4 },
      ],
    },
  ],
};

export const SearchPeopleOutput: Story = {
  args: {
    partType: 'tool-searchPeople',
    partState: 'output-available',
    partOutput: searchPeopleOutput,
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
