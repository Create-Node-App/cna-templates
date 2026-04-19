import type { Meta, StoryObj } from '@storybook/react';
import { ComparisonTableCard } from './ComparisonTableCard';

const meta: Meta<typeof ComparisonTableCard> = {
  title: 'Assistant/ComparisonTableCard',
  component: ComparisonTableCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    entityIds: { control: 'object' },
    tenantSlug: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof ComparisonTableCard>;

const comparison = {
  headers: ['Attribute', 'Jane Doe', 'John Smith'],
  rows: [
    { label: 'React', values: ['4', '3'] },
    { label: 'TypeScript', values: ['5', '4'] },
    { label: 'Leadership', values: ['3', '4'] },
  ],
  raw: '',
};

export const Default: Story = {
  args: {
    comparison,
  },
};

export const WithEntityLinks: Story = {
  args: {
    comparison,
    entityIds: ['entity-1', 'entity-2'],
    tenantSlug: 'demo',
  },
};
