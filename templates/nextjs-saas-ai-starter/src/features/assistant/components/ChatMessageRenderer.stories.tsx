import type { Meta, StoryObj } from '@storybook/react';
import { ChatMessageRenderer } from './ChatMessageRenderer';

const meta: Meta<typeof ChatMessageRenderer> = {
  title: 'Assistant/ChatMessageRenderer',
  component: ChatMessageRenderer,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    content: { control: 'text' },
    tenantSlug: { control: 'text' },
    isUserMessage: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof ChatMessageRenderer>;

const markdownOnly = `
Here are some **suggestions** for your next steps:

1. Review your skill levels
2. Explore capabilities that match your profile
3. Find learning resources

Let me know if you need more details.
`;

export const MarkdownOnly: Story = {
  args: {
    content: markdownOnly.trim(),
    isUserMessage: false,
  },
};

export const WithTenantSlug: Story = {
  args: {
    content: markdownOnly.trim(),
    tenantSlug: 'demo',
    isUserMessage: false,
  },
};

/** Text that triggers pattern detection (person list). */
const textWithPersonPattern = `
People with React skills:

• **Jane Doe** - Engineering
  Skills: React (4), TypeScript (5)

• **John Smith** - Product
  Skills: React (3), Node.js (4)
`;

export const WithDetectedPersonPattern: Story = {
  args: {
    content: textWithPersonPattern.trim(),
    tenantSlug: 'demo',
    isUserMessage: false,
  },
};

export const UserMessage: Story = {
  args: {
    content: 'Who has experience with TypeScript?',
    isUserMessage: true,
  },
};
