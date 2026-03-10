import type { Meta, StoryObj } from '@storybook/react';

import { FormFieldError, FormGlobalError, FormLabel } from './form';
import { Input } from './input';

const meta: Meta<typeof FormLabel> = {
  title: 'Atoms/Form',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Form primitives for required indicator, field-level error, and global form error. Aligned with ClickUp-style forms.',
      },
    },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// FormLabel
// ---------------------------------------------------------------------------

export const LabelOptional: StoryObj = {
  render: () => (
    <div className="w-[320px] space-y-2">
      <FormLabel htmlFor="opt">Task name</FormLabel>
      <Input id="opt" placeholder="Enter task name" />
    </div>
  ),
  parameters: { docs: { description: { story: 'Optional field – no asterisk.' } } },
};

export const LabelRequired: StoryObj = {
  render: () => (
    <div className="w-[320px] space-y-2">
      <FormLabel htmlFor="req" required>
        Task name
      </FormLabel>
      <Input id="req" placeholder="Enter task name" required />
    </div>
  ),
  parameters: { docs: { description: { story: 'Required field – red asterisk after label (ClickUp-style).' } } },
};

// ---------------------------------------------------------------------------
// FormFieldError (missing field)
// ---------------------------------------------------------------------------

export const FieldError: StoryObj = {
  render: () => (
    <div className="w-[320px] space-y-2">
      <FormLabel htmlFor="err" required>
        Email
      </FormLabel>
      <Input id="err" placeholder="you@example.com" className="border-destructive focus-visible:ring-destructive" />
      <FormFieldError visible>This field is required.</FormFieldError>
    </div>
  ),
  parameters: { docs: { description: { story: 'Missing/invalid field message below the control.' } } },
};

export const FieldErrorHidden: StoryObj = {
  render: () => (
    <div className="w-[320px] space-y-2">
      <FormLabel htmlFor="hid" required>
        Email
      </FormLabel>
      <Input id="hid" placeholder="you@example.com" />
      <FormFieldError visible={false}>This field is required.</FormFieldError>
    </div>
  ),
  parameters: { docs: { description: { story: 'Field error with visible=false – nothing rendered.' } } },
};

// ---------------------------------------------------------------------------
// FormGlobalError
// ---------------------------------------------------------------------------

export const GlobalError: StoryObj = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <FormGlobalError visible title="Could not save">
        Please check your connection and try again. If the problem persists, contact support.
      </FormGlobalError>
      <FormLabel htmlFor="ge1" required>
        Task name
      </FormLabel>
      <Input id="ge1" placeholder="Enter task name" />
    </div>
  ),
  parameters: { docs: { description: { story: 'Form-level error banner at top of form (ClickUp-style).' } } },
};

export const GlobalErrorMessageOnly: StoryObj = {
  render: () => (
    <div className="w-[400px]">
      <FormGlobalError visible>Invalid email or password.</FormGlobalError>
    </div>
  ),
  parameters: { docs: { description: { story: 'Global error without title – message only.' } } },
};

export const GlobalErrorHidden: StoryObj = {
  render: () => (
    <div className="w-[400px]">
      <FormGlobalError visible={false} title="Error">
        This message is not shown.
      </FormGlobalError>
    </div>
  ),
  parameters: { docs: { description: { story: 'Global error with visible=false – nothing rendered.' } } },
};

// ---------------------------------------------------------------------------
// Combined form example (ClickUp-style)
// ---------------------------------------------------------------------------

export const FullFormExample: StoryObj = {
  render: () => (
    <form className="w-[400px] space-y-5" onSubmit={(e) => e.preventDefault()}>
      <FormGlobalError visible title="Validation failed">
        Some required fields are missing or invalid. Please fix them below.
      </FormGlobalError>

      <div className="space-y-2">
        <FormLabel htmlFor="f-name" required>
          Task name
        </FormLabel>
        <Input id="f-name" placeholder="e.g. Review Q1 goals" className="border-destructive" />
        <FormFieldError visible>This field is required.</FormFieldError>
      </div>

      <div className="space-y-2">
        <FormLabel htmlFor="f-desc">Description</FormLabel>
        <Input id="f-desc" placeholder="Optional description" />
      </div>

      <div className="space-y-2">
        <FormLabel htmlFor="f-email" required>
          Assignee email
        </FormLabel>
        <Input id="f-email" placeholder="assignee@company.com" />
        <FormFieldError visible={false}>Only shown when invalid.</FormFieldError>
      </div>
    </form>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Complete form with global error, required labels, and one field showing a missing-field error (ClickUp-style).',
      },
    },
  },
};
