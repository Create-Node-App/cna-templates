import type { Meta, StoryObj } from '@storybook/react';
import { TeamMemberCard } from './team-member-card';

const meta: Meta<typeof TeamMemberCard> = {
  title: 'Molecules/TeamMemberCard',
  component: TeamMemberCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Team directory card: avatar, name, status, title, location, skills count, account badge (with account / pre-loaded), optional bio. Used on the team page.',
      },
    },
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['active', 'onboarding', 'inactive'],
    },
    hasAccount: { control: 'boolean' },
    skillsCount: { control: { type: 'number', min: 0 } },
  },
};

export default meta;

type Story = StoryObj<typeof TeamMemberCard>;

const defaultArgs = {
  name: 'Valentina Diaz',
  initials: 'VD',
  status: 'active' as const,
  title: 'Machine Learning Engineer',
  location: 'Buenos Aires, Argentina',
  skillsCount: 9,
  skillsLabel: 'Skills',
  hasAccount: false,
  withAccountLabel: 'With account',
  preloadedLabel: 'Pre-loaded',
};

const sampleTopSkills = [
  { name: 'Machine Learning', level: 4 },
  { name: 'Python', level: 4 },
  { name: 'TensorFlow', level: 3 },
  { name: 'NLP', level: 3 },
  { name: 'Computer Vision', level: 3 },
];

export const Default: Story = {
  args: {
    ...defaultArgs,
    topSkills: sampleTopSkills,
    bio: 'Pre-loaded ML engineer specializing in NLP and computer vision. Building production ML systems with focus on scalability.',
  },
};

export const WithAccount: Story = {
  args: {
    ...defaultArgs,
    hasAccount: true,
    bio: 'ML engineer with linked account and full profile.',
  },
};

export const Preloaded: Story = {
  args: {
    ...defaultArgs,
    hasAccount: false,
    preloadedLabel: 'Pre-loaded',
    bio: 'Pre-loaded profile; complete onboarding to link account.',
  },
};

export const WithLink: Story = {
  args: {
    ...defaultArgs,
    href: '#',
    bio: 'Card as link to team member profile.',
  },
};

export const Onboarding: Story = {
  args: {
    ...defaultArgs,
    status: 'onboarding',
    title: 'Software Engineer',
    location: 'Remote',
    skillsCount: 3,
    hasAccount: true,
    bio: 'New team member in onboarding.',
  },
};

export const Minimal: Story = {
  args: {
    name: 'Alex Kim',
    status: 'active',
    skillsCount: 0,
    skillsLabel: 'Skills',
    hasAccount: true,
    withAccountLabel: 'With account',
    preloadedLabel: 'Pre-loaded',
  },
};
