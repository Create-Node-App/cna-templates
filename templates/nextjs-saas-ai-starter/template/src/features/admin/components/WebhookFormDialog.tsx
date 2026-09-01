'use client';

/**
 * Dialog for creating/editing webhook endpoints.
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import {
  Badge,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/shared/components/ui';

import {
  createWebhookEndpoint,
  updateWebhookEndpoint,
  type WebhookEndpointInput,
  type WebhookEndpointOutput,
} from '../services/webhook-admin-service';

const webhookFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  url: z.string().min(1, 'URL is required').url('Invalid URL format'),
  description: z.string(),
  selectedEvents: z.array(z.string()).min(1, 'Select at least one event'),
  enabled: z.boolean(),
  retryCount: z.string(),
});

type WebhookFormValues = z.infer<typeof webhookFormSchema>;

interface WebhookFormDialogProps {
  tenantSlug: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventTypes: { value: string; label: string; category: string }[];
  editingEndpoint: WebhookEndpointOutput | null;
}

function getDefaultValues(editingEndpoint: WebhookEndpointOutput | null): WebhookFormValues {
  if (editingEndpoint) {
    return {
      name: editingEndpoint.name,
      url: editingEndpoint.url,
      description: editingEndpoint.description ?? '',
      selectedEvents: editingEndpoint.events ?? [],
      enabled: editingEndpoint.enabled ?? true,
      retryCount: String(editingEndpoint.retryCount ?? 3),
    };
  }
  return {
    name: '',
    url: '',
    description: '',
    selectedEvents: [],
    enabled: true,
    retryCount: '3',
  };
}

export function WebhookFormDialog({
  tenantSlug,
  isOpen,
  onClose,
  onSuccess,
  eventTypes,
  editingEndpoint,
}: WebhookFormDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: getDefaultValues(editingEndpoint),
  });

  const isPending = form.formState.isSubmitting;

  const handleOpenChange = (open: boolean) => {
    if (open) {
      form.reset(getDefaultValues(editingEndpoint));
      setServerError(null);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect -- Reset when parent-controlled `isOpen`/`editingEndpoint` props change; effect required for prop-driven state sync */
  useEffect(() => {
    if (isOpen) {
      form.reset(getDefaultValues(editingEndpoint));
      setServerError(null);
    }
  }, [isOpen, editingEndpoint, form]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Group events by category
  const eventsByCategory = eventTypes.reduce(
    (acc, event) => {
      if (!acc[event.category]) {
        acc[event.category] = [];
      }
      acc[event.category].push(event);
      return acc;
    },
    {} as Record<string, typeof eventTypes>,
  );

  const selectedEvents = useWatch({ control: form.control, name: 'selectedEvents' });

  const handleEventToggle = (eventValue: string) => {
    const current = form.getValues('selectedEvents');
    const next = current.includes(eventValue) ? current.filter((e) => e !== eventValue) : [...current, eventValue];
    form.setValue('selectedEvents', next, { shouldValidate: true });
  };

  const handleSelectAllCategory = (category: string) => {
    const categoryEvents = eventsByCategory[category]?.map((e) => e.value) ?? [];
    const current = form.getValues('selectedEvents');
    const allSelected = categoryEvents.every((e) => current.includes(e));
    const next = allSelected
      ? current.filter((e) => !categoryEvents.includes(e))
      : [...new Set([...current, ...categoryEvents])];
    form.setValue('selectedEvents', next, { shouldValidate: true });
  };

  const onSubmit = (data: WebhookFormValues) => {
    setServerError(null);
    const input: WebhookEndpointInput = {
      name: data.name.trim(),
      url: data.url.trim(),
      description: data.description.trim() || undefined,
      events: data.selectedEvents,
      enabled: data.enabled,
      retryCount: parseInt(data.retryCount, 10),
    };

    if (editingEndpoint) {
      updateWebhookEndpoint(tenantSlug, editingEndpoint.id, input).then((result) => {
        if (result.success) {
          onSuccess();
          onClose();
        } else {
          setServerError(result.error ?? 'Failed to update');
        }
      });
    } else {
      createWebhookEndpoint(tenantSlug, input).then((result) => {
        if (result.success) {
          onSuccess();
          onClose();
        } else {
          setServerError(result.error ?? 'Failed to create');
        }
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
        else handleOpenChange(true);
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingEndpoint ? 'Edit Webhook' : 'Create Webhook'}</DialogTitle>
          <DialogDescription>
            {editingEndpoint
              ? 'Update the webhook endpoint configuration.'
              : 'Configure a new webhook endpoint to receive event notifications.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <p className="text-sm text-destructive" role="alert">
                {serverError}
              </p>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Slack Notifications" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL *</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://hooks.slack.com/services/..." {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">HTTPS required in production.</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional notes about this webhook..." rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="selectedEvents"
              render={() => (
                <FormItem>
                  <FormLabel>Events *</FormLabel>
                  <p className="text-xs text-muted-foreground">Select which events should trigger this webhook.</p>
                  <FormControl>
                    <div className="border rounded-md p-3 space-y-4 max-h-48 overflow-y-auto">
                      {Object.entries(eventsByCategory).map(([category, events]) => {
                        const allSelected = events.every((e) => selectedEvents.includes(e.value));
                        const someSelected = events.some((e) => selectedEvents.includes(e.value));

                        return (
                          <div key={category}>
                            <label className="flex items-center gap-2 cursor-pointer mb-2">
                              <Checkbox
                                checked={allSelected}
                                onCheckedChange={() => handleSelectAllCategory(category)}
                                className={someSelected && !allSelected ? 'data-[state=checked]:bg-primary/50' : ''}
                              />
                              <span className="text-sm font-medium">{category}</span>
                            </label>
                            <div className="ml-6 flex flex-wrap gap-1.5">
                              {events.map((event) => {
                                const isSelected = selectedEvents.includes(event.value);
                                return (
                                  <Badge
                                    key={event.value}
                                    variant={isSelected ? 'default' : 'outline'}
                                    className={`cursor-pointer transition-all ${
                                      isSelected ? 'bg-primary text-primary-foreground' : 'opacity-60 hover:opacity-100'
                                    }`}
                                    onClick={() => handleEventToggle(event.value)}
                                  >
                                    {isSelected && <Check className="mr-1 h-3 w-3" />}
                                    {event.value}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </FormControl>
                  {selectedEvents.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="retryCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Retry Attempts</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">No retries</SelectItem>
                      <SelectItem value="1">1 retry</SelectItem>
                      <SelectItem value="2">2 retries</SelectItem>
                      <SelectItem value="3">3 retries (default)</SelectItem>
                      <SelectItem value="5">5 retries</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Enabled</FormLabel>
                      <p className="text-xs text-muted-foreground">Disabled webhooks won&apos;t receive any events.</p>
                    </div>
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingEndpoint ? 'Save Changes' : 'Create Webhook'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
