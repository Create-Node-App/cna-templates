import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { type ViewMode, ViewModeToggle } from './view-mode-toggle';

const meta: Meta<typeof ViewModeToggle> = {
  title: 'Atoms/ViewModeToggle',
  component: ViewModeToggle,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'radio',
      options: ['list', 'radar'],
    },
    listLabel: { control: 'text' },
    radarLabel: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof ViewModeToggle>;

function ViewModeToggleControlled(args: { value: ViewMode; listLabel?: string; radarLabel?: string }) {
  const [value, setValue] = useState<ViewMode>(args.value ?? 'list');
  return <ViewModeToggle {...args} value={value} onChange={setValue} />;
}

export const Default: Story = {
  render: (args) => <ViewModeToggleControlled {...args} />,
  args: {
    value: 'list',
    listLabel: 'List',
    radarLabel: 'Radar',
  },
};

export const RadarSelected: Story = {
  render: (args) => <ViewModeToggleControlled {...args} />,
  args: {
    value: 'radar',
    listLabel: 'List',
    radarLabel: 'Radar',
  },
};

export const CustomLabels: Story = {
  render: (args) => <ViewModeToggleControlled {...args} />,
  args: {
    value: 'list',
    listLabel: 'Table',
    radarLabel: 'Chart',
  },
};
