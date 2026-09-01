import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

const meta: Meta<typeof Card> = {
  title: 'Atoms/Card',
  component: Card,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description or supporting text.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here. Use slots for flexibility.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithSkillAction: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Skill card</CardTitle>
        <CardDescription>Example with Next.js SaaS AI Template skill variant.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content for a skill-related card.</p>
      </CardContent>
      <CardFooter>
        <Button variant="skill">Skill action</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithInterestAction: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Interest card</CardTitle>
        <CardDescription>Example with Next.js SaaS AI Template interest variant.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content for an interest-related card.</p>
      </CardContent>
      <CardFooter>
        <Button variant="interest">Interest action</Button>
      </CardFooter>
    </Card>
  ),
};
