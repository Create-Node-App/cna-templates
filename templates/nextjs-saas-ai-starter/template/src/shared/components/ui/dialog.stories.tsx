import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

const meta: Meta<typeof Dialog> = {
  title: 'Molecules/Dialog',
  component: Dialog,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Dialog>;

function DemoDialog({ destructive = false }: { destructive?: boolean }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={destructive ? 'destructive' : 'default'}>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{destructive ? 'Delete workspace?' : 'Invite member'}</DialogTitle>
          <DialogDescription>
            {destructive
              ? 'This action cannot be undone. All data will be permanently removed.'
              : 'Send an invitation email to add someone to your workspace.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant={destructive ? 'destructive' : 'default'}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const Default: Story = {
  render: () => <DemoDialog />,
};

export const Destructive: Story = {
  render: () => <DemoDialog destructive />,
};

export const LongContent: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Read terms</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Terms of service</DialogTitle>
          <DialogDescription>Last updated January 2026.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>1. Acceptable use. You agree not to misuse the service.</p>
          <p>2. Data. Your data remains yours; we process it to provide the service.</p>
          <p>3. Termination. Either party may terminate with 30 days notice.</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
