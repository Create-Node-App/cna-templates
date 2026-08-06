'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast as sonnerToast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/shared/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
const toast = (props: { title: string; description?: string; variant?: string }) => {
  if (props.variant === 'destructive') sonnerToast.error(props.title, { description: props.description });
  else sonnerToast.success(props.title, { description: props.description });
};
import { updateProfileSettings } from '../services/profile-update-service';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().optional(),
  bio: z.string().optional(),
  githubUsername: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileSettingsFormProps {
  tenantSlug: string;
  person: {
    id: string;
    name: string | null;
    title: string | null;
    bio: string | null;
    linkedinUrl?: string | null;
    githubUsername: string | null;
  };
}

export function ProfileSettingsForm({ tenantSlug, person }: ProfileSettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: person.name ?? '',
      title: person.title ?? '',
      bio: person.bio ?? '',
      githubUsername: person.githubUsername ?? '',
    },
  });

  function onSubmit(data: ProfileFormValues) {
    startTransition(async () => {
      const result = await updateProfileSettings(tenantSlug, {
        name: data.name,
        title: data.title || null,
        bio: data.bio || null,
        githubUsername: data.githubUsername || null,
      });

      if (result.success) {
        toast({ title: 'Profile updated successfully' });
      } else {
        toast({ title: 'Failed to update profile', description: result.error, variant: 'destructive' });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Your full name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Software Engineer" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="A short bio about yourself" rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="githubUsername"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GitHub Username</FormLabel>
              <FormControl>
                <Input {...field} placeholder="your-github-username" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}
