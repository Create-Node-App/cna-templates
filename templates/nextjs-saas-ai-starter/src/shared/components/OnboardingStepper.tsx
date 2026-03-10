'use client';

import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface Step {
  id: string;
  label: string;
  description?: string;
}

interface OnboardingStepperProps {
  steps: Step[];
  currentStep: string;
  className?: string;
}

export function OnboardingStepper({ steps, currentStep, className }: OnboardingStepperProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop stepper */}
      <div className="hidden sm:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                    isCompleted && 'bg-primary border-primary text-primary-foreground',
                    isCurrent && 'border-primary bg-primary/10 text-primary',
                    !isCompleted && !isCurrent && 'border-muted-foreground/30 text-muted-foreground',
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className={cn('text-sm font-medium', isCurrent ? 'text-primary' : 'text-muted-foreground')}>
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 max-w-24">{step.description}</p>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 h-0.5 bg-muted">
                  <div
                    className={cn('h-full bg-primary transition-all duration-500', isCompleted ? 'w-full' : 'w-0')}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile stepper - simplified */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-primary">{steps[currentIndex]?.label}</span>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {steps.length}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
