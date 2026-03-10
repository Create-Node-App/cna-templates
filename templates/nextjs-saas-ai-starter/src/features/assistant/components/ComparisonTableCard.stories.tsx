import type { Meta, StoryObj } from '@storybook/react';
import { ComparisonTableCard } from './ComparisonTableCard';

const meta: Meta<typeof ComparisonTableCard> = {
  title: 'Assistant/ComparisonTableCard',
  component: ComparisonTableCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    personIds: { control: 'object' },
    tenantSlug: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof ComparisonTableCard>;

const comparison = {
  headers: ['Skill', 'Jane Doe', 'John Smith'],
  rows: [
    { skill: 'React', values: ['4', '3'] },
    { skill: 'TypeScript', values: ['5', '4'] },
    { skill: 'Leadership', values: ['3', '4'] },
  ],
  raw: '',
};

export const Default: Story = {
  args: {
    comparison,
  },
};

export const WithPersonLinks: Story = {
  args: {
    comparison,
    personIds: ['person-1', 'person-2'],
    tenantSlug: 'demo',
  },
};
