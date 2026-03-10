'use client';

/**
 * Wizard Step Indicator
 *
 * Horizontal step indicator with connector line and optional completion state.
 * Used in SelfAssessmentWizard (Scope → Skills → Assess) and other multi-step flows.
 */

import { Check } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

export interface WizardStepIndicatorStep {
  id: string;
  label: string;
}

export interface WizardStepIndicatorProps {
  steps: WizardStepIndicatorStep[];
  currentStepId: string;
  /** When true, the last step shows a check (e.g. assessment complete). */
  lastStepComplete?: boolean;
  className?: string;
}

export function WizardStepIndicator({
  steps,
  currentStepId,
  lastStepComplete = false,
  className,
}: WizardStepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStepId);
  const currentStepIndex = currentIndex >= 0 ? currentIndex : 0;

  // Connector fill: 0% on step 0, 50% on step 1, 100% on step 2 (for 3 steps)
  const fillPercent =
    steps.length <= 1 ? 0 : currentStepIndex === 0 ? 0 : (currentStepIndex / (steps.length - 1)) * 100;

  return (
    <div className={cn('p-6', className)}>
      <div className="flex items-center justify-between relative">
        {/* Connector line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-primary/20 rounded-full z-0">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${fillPercent}%` }}
          />
        </div>

        {steps.map((step, index) => {
          const isCurrent = step.id === currentStepId;
          const isCompleted =
            index < currentStepIndex || (index === currentStepIndex && index === steps.length - 1 && lastStepComplete);
          const isFilled = isCurrent || currentStepIndex > index || (index === steps.length - 1 && lastStepComplete);

          return (
            <div key={step.id} className="flex flex-col items-center gap-2 flex-1 relative z-10">
              <div
                className={cn(
                  'relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                  isCurrent && 'bg-primary text-white shadow-lg scale-110 ring-4 ring-primary/30',
                  !isCurrent && isFilled && 'bg-primary text-white shadow-md ring-2 ring-primary/20',
                  !isCurrent && !isFilled && 'bg-card border-2 border-primary/30 text-muted-foreground',
                )}
                style={{
                  backgroundColor: isCurrent || isFilled ? undefined : 'hsl(var(--card))',
                }}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 relative z-10" aria-hidden />
                ) : (
                  <span className="relative z-10">{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  'text-sm font-medium transition-colors',
                  isCurrent && 'text-primary font-semibold',
                  !isCurrent && isFilled && 'text-primary font-medium',
                  !isCurrent && !isFilled && 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
