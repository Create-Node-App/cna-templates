'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as React from 'react';

import { cn } from '@/shared/lib/utils';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      'peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 shadow-sm transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 dark:data-[state=checked]:bg-green-500 dark:data-[state=checked]:border-green-500',
      'data-[state=unchecked]:bg-muted data-[state=unchecked]:border-muted-foreground/50 hover:data-[state=unchecked]:border-muted-foreground/70',
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        'pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-all duration-200',
        'data-[state=checked]:translate-x-5 data-[state=checked]:bg-white',
        'data-[state=unchecked]:translate-x-0.5 data-[state=unchecked]:bg-muted-foreground/60',
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
