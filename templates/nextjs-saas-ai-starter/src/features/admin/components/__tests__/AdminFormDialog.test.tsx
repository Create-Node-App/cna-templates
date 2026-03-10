/**
 * Tests for AdminFormDialog component
 */

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AdminFormDialog } from '../AdminFormDialog';

describe('AdminFormDialog', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    title: 'Test Dialog',
    onSubmit: jest.fn((e: React.FormEvent) => e.preventDefault()),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render when open is true', () => {
      render(
        <AdminFormDialog {...defaultProps}>
          <input data-testid="test-input" />
        </AdminFormDialog>,
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      render(
        <AdminFormDialog {...defaultProps} open={false}>
          <input data-testid="test-input" />
        </AdminFormDialog>,
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(
        <AdminFormDialog {...defaultProps} description="This is a description">
          <input data-testid="test-input" />
        </AdminFormDialog>,
      );

      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });

    it('should render children content', () => {
      render(
        <AdminFormDialog {...defaultProps}>
          <p>Form content here</p>
        </AdminFormDialog>,
      );

      expect(screen.getByText('Form content here')).toBeInTheDocument();
    });

    it('should render custom submit label', () => {
      render(
        <AdminFormDialog {...defaultProps} submitLabel="Create Item">
          <input data-testid="test-input" />
        </AdminFormDialog>,
      );

      expect(screen.getByText('Create Item')).toBeInTheDocument();
    });

    it('should render default submit label when not provided', () => {
      render(
        <AdminFormDialog {...defaultProps}>
          <input data-testid="test-input" />
        </AdminFormDialog>,
      );

      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper aria attributes', () => {
      render(
        <AdminFormDialog {...defaultProps} description="Test description">
          <input data-testid="test-input" />
        </AdminFormDialog>,
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-describedby');
    });

    it('should have close button with accessible label', () => {
      render(
        <AdminFormDialog {...defaultProps}>
          <input data-testid="test-input" />
        </AdminFormDialog>,
      );

      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(
        <AdminFormDialog {...defaultProps} onClose={onClose}>
          <input data-testid="test-input" />
        </AdminFormDialog>,
      );

      await user.click(screen.getByLabelText('Close dialog'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(
        <AdminFormDialog {...defaultProps} onClose={onClose}>
          <input data-testid="test-input" />
        </AdminFormDialog>,
      );

      await user.click(screen.getByText('Cancel'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(
        <AdminFormDialog {...defaultProps} onClose={onClose}>
          <input data-testid="test-input" />
        </AdminFormDialog>,
      );

      // Click the backdrop (parent div with aria-hidden)
      const backdrop = document.querySelector('[aria-hidden="true"]');
      if (backdrop) {
        await user.click(backdrop);
        expect(onClose).toHaveBeenCalledTimes(1);
      }
    });

    it('should call onSubmit when form is submitted', () => {
      const onSubmit = jest.fn((e: React.FormEvent) => e.preventDefault());

      render(
        <AdminFormDialog {...defaultProps} onSubmit={onSubmit}>
          <input data-testid="test-input" />
        </AdminFormDialog>,
      );

      const form = document.querySelector('form');
      if (form) {
        fireEvent.submit(form);
        expect(onSubmit).toHaveBeenCalledTimes(1);
      }
    });

    it('should call onClose when Escape key is pressed', () => {
      const onClose = jest.fn();

      render(
        <AdminFormDialog {...defaultProps} onClose={onClose}>
          <input data-testid="test-input" />
        </AdminFormDialog>,
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when Escape is pressed and isSubmitting', () => {
      const onClose = jest.fn();

      render(
        <AdminFormDialog {...defaultProps} onClose={onClose} isSubmitting>
          <input data-testid="test-input" />
        </AdminFormDialog>,
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('submitting state', () => {
    it('should show loading state when isSubmitting', () => {
      render(
        <AdminFormDialog {...defaultProps} isSubmitting>
          <input data-testid="test-input" />
        </AdminFormDialog>,
      );

      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Saving/ })).toHaveAttribute('aria-busy', 'true');
    });

    it('should disable buttons when isSubmitting', () => {
      render(
        <AdminFormDialog {...defaultProps} isSubmitting>
          <input data-testid="test-input" />
        </AdminFormDialog>,
      );

      expect(screen.getByLabelText('Close dialog')).toBeDisabled();
      expect(screen.getByText('Cancel')).toBeDisabled();
      expect(screen.getByRole('button', { name: /Saving/ })).toBeDisabled();
    });

    it('should not close on backdrop click when isSubmitting', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(
        <AdminFormDialog {...defaultProps} onClose={onClose} isSubmitting>
          <input data-testid="test-input" />
        </AdminFormDialog>,
      );

      const backdrop = document.querySelector('[aria-hidden="true"]');
      if (backdrop) {
        await user.click(backdrop);
        expect(onClose).not.toHaveBeenCalled();
      }
    });
  });

  describe('sizes', () => {
    it.each(['sm', 'md', 'lg', 'xl'] as const)('should apply %s size class', (size) => {
      render(
        <AdminFormDialog {...defaultProps} size={size}>
          <input data-testid="test-input" />
        </AdminFormDialog>,
      );

      const dialog = screen.getByRole('dialog');
      const expectedClass =
        size === 'sm' ? 'max-w-md' : size === 'md' ? 'max-w-lg' : size === 'lg' ? 'max-w-2xl' : 'max-w-4xl';

      expect(dialog).toHaveClass(expectedClass);
    });
  });
});
