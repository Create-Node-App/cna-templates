import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

const meta: Meta<typeof Popover> = {
  title: 'Molecules/Popover',
  component: Popover,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-sm font-medium">Notifications</p>
        <p className="text-sm text-muted-foreground">You are all caught up.</p>
      </PopoverContent>
    </Popover>
  ),
};

export const WithActions: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Share document</Button>
      </PopoverTrigger>
      <PopoverContent className="space-y-2">
        <p className="text-sm font-medium">Share this document</p>
        <div className="flex gap-2">
          <Button size="sm">Copy link</Button>
          <Button size="sm" variant="outline">
            Manage access
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const AlignedEnd: Story = {
  render: () => (
    <div className="flex justify-end">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open (align end)</Button>
        </PopoverTrigger>
        <PopoverContent align="end">
          <p className="text-sm text-muted-foreground">Pinned to the trigger&apos;s end edge.</p>
        </PopoverContent>
      </Popover>
    </div>
  ),
};
