import type { Meta, StoryObj } from '@storybook/react';
import { PersonMiniCard } from './PersonMiniCard';

const meta: Meta<typeof PersonMiniCard> = {
  title: 'Assistant/PersonMiniCard',
  component: PersonMiniCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    personId: { control: 'text' },
    tenantSlug: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof PersonMiniCard>;

const person = {
  name: 'Jane Doe',
  category: 'Engineering',
  attributes: [
    { name: 'React', level: 4 },
    { name: 'TypeScript', level: 5 },
  ],
  raw: '',
};

export const Default: Story = {
  args: {
    person,
    rank: 1,
  },
};

export const WithLink: Story = {
  args: {
    person,
    rank: 1,
    personId: 'person-123',
    tenantSlug: 'demo',
  },
};

export const WithoutPersonId: Story = {
  args: {
    person: { ...person, name: 'John Smith' },
    rank: 2,
    tenantSlug: 'demo',
  },
};
