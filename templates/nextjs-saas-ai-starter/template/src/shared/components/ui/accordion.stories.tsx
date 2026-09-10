import type { Meta, StoryObj } from '@storybook/react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Molecules/Accordion',
  component: Accordion,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Accordion>;

function SingleItem({ value, trigger, content }: { value: string; trigger: string; content: string }) {
  return (
    <AccordionItem value={value}>
      <AccordionTrigger>{trigger}</AccordionTrigger>
      <AccordionContent>{content}</AccordionContent>
    </AccordionItem>
  );
}

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <SingleItem
        value="item-1"
        trigger="What is this template?"
        content="A Next.js SaaS starter with AI features, multi-tenancy, and billing built in."
      />
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" defaultValue={['item-1']} className="w-full max-w-md">
      <SingleItem value="item-1" trigger="First section" content="First section content." />
      <SingleItem value="item-2" trigger="Second section" content="Second section content." />
      <SingleItem value="item-3" trigger="Third section" content="Third section content." />
    </Accordion>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Accordion type="single" collapsible disabled className="w-full max-w-md">
      <SingleItem value="item-1" trigger="Disabled section" content="You cannot open this." />
    </Accordion>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Accordion type="single" collapsible defaultValue="open">
        <AccordionItem value="open">
          <AccordionTrigger>Open by default</AccordionTrigger>
          <AccordionContent>Visible without interaction.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="closed">
          <AccordionTrigger>Closed by default</AccordionTrigger>
          <AccordionContent>Hidden until expanded.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};
