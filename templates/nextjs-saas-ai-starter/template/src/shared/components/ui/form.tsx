'use client';

/**
 * Form components — Official shadcn Form wrapper for react-hook-form
 * plus custom Next.js SaaS AI Template additions (FormFieldError, FormGlobalError).
 */

import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import { AlertCircle } from 'lucide-react';
import * as React from 'react';
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
} from 'react-hook-form';

import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/utils';

// ============================================================================
// shadcn Form primitives (react-hook-form integration)
// ============================================================================

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId();

    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn('space-y-2', className)} {...props} />
      </FormItemContext.Provider>
    );
  },
);
FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & { required?: boolean }
>(({ className, required, children, ...props }, ref) => {
  const { error, formItemId } = useFormFieldSafe();

  return (
    <Label ref={ref} className={cn(error && 'text-destructive', className)} htmlFor={formItemId} {...props}>
      {children}
      {required && (
        <span className="text-destructive ml-0.5 font-normal" aria-hidden>
          *
        </span>
      )}
    </Label>
  );
});
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(
  ({ ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

    return (
      <Slot
        ref={ref}
        id={formItemId}
        aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
        aria-invalid={!!error}
        {...props}
      />
    );
  },
);
FormControl.displayName = 'FormControl';

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField();

    return (
      <p ref={ref} id={formDescriptionId} className={cn('text-[0.8rem] text-muted-foreground', className)} {...props} />
    );
  },
);
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message) : children;

    if (!body) {
      return null;
    }

    return (
      <p
        ref={ref}
        id={formMessageId}
        className={cn('text-[0.8rem] font-medium text-destructive', className)}
        {...props}
      >
        {body}
      </p>
    );
  },
);
FormMessage.displayName = 'FormMessage';

// ============================================================================
// Safe hook that works both inside and outside FormField context
// ============================================================================

function useFormFieldSafe() {
  try {
    return useFormField();
  } catch {
    return { error: undefined, formItemId: undefined, formDescriptionId: undefined, formMessageId: undefined };
  }
}

// ============================================================================
// Next.js SaaS AI Template custom additions (backward-compatible)
// ============================================================================

export interface FormFieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
  visible?: boolean;
}

const FormFieldError = React.forwardRef<HTMLParagraphElement, FormFieldErrorProps>(
  ({ className, children, visible = true, ...props }, ref) => {
    if (!visible || !children) return null;
    return (
      <p
        ref={ref}
        role="alert"
        className={cn('text-sm text-destructive mt-1.5 flex items-center gap-1.5', className)}
        {...props}
      >
        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {children}
      </p>
    );
  },
);
FormFieldError.displayName = 'FormFieldError';

export interface FormGlobalErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  visible?: boolean;
  title?: string;
}

const FormGlobalError = React.forwardRef<HTMLDivElement, FormGlobalErrorProps>(
  ({ className, children, visible = true, title, ...props }, ref) => {
    if (!visible || (!children && !title)) return null;
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive',
          'flex items-start gap-3',
          className,
        )}
        {...props}
      >
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
        <div className="min-w-0 flex-1">
          {title && <p className="font-medium text-destructive text-sm mb-0.5">{title}</p>}
          {children && <p className="text-sm text-destructive [&_p]:leading-relaxed">{children}</p>}
        </div>
      </div>
    );
  },
);
FormGlobalError.displayName = 'FormGlobalError';

// ============================================================================
// Exports
// ============================================================================

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  FormFieldError,
  FormGlobalError,
};

/** Alias for backward-compatible FormLabelProps type */
export type FormLabelProps = React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & { required?: boolean };
