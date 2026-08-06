import type { Meta, StoryObj } from '@storybook/react';
import { WizardStepIndicator } from './wizard-step-indicator';

const selfAssessmentSteps = [
  { id: 'scope', label: 'Scope' },
  { id: 'skills', label: 'Skills' },
  { id: 'assess', label: 'Assess' },
];

const meta: Meta<typeof WizardStepIndicator> = {
  title: 'Molecules/WizardStepIndicator',
  component: WizardStepIndicator,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Horizontal step indicator with connector. Used in SelfAssessmentWizard (Scope → Skills → Assess).',
      },
    },
  },
  argTypes: {
    currentStepId: { control: 'select', options: selfAssessmentSteps.map((s) => s.id) },
  },
};

export default meta;

type Story = StoryObj<typeof WizardStepIndicator>;

export const Step1Scope: Story = {
  args: {
    steps: selfAssessmentSteps,
    currentStepId: 'scope',
  },
};

export const Step2Skills: Story = {
  args: {
    steps: selfAssessmentSteps,
    currentStepId: 'skills',
  },
};

export const Step3Assess: Story = {
  args: {
    steps: selfAssessmentSteps,
    currentStepId: 'assess',
  },
};

export const Step3AssessComplete: Story = {
  args: {
    steps: selfAssessmentSteps,
    currentStepId: 'assess',
    lastStepComplete: true,
  },
};

export const TwoSteps: Story = {
  args: {
    steps: [
      { id: 'details', label: 'Details' },
      { id: 'confirm', label: 'Confirm' },
    ],
    currentStepId: 'details',
  },
};
