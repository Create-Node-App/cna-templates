'use client';

/**
 * Tenant Invitations Admin Client
 *
 * Client component for managing tenant invitations with URL generation.
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Clock, Copy, Link2, Mail, RefreshCw, Trash2, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { AdminFormDialog, AdminPageHeader } from '@/features/admin';
import {
  createInvite,
  type CreateInviteInput,
  type InviteWithDetails,
  listInvites,
  resendInvite,
  revokeInvite,
} from '@/features/admin/services/invite-service';
import { getAvailableRoles } from '@/features/admin/services/members-service';
import type { GetAvailableRolesResult, TenantRole } from '@/features/admin/types';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

const inviteFormSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  roleId: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  message: z.string(),
  expiresInDays: z.number(),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

interface InvitesClientProps {
  tenantSlug: string;
}

const ROLE_COLORS: Record<TenantRole, string> = {
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  member: 'bg-muted text-foreground',
};

const STATUS_ICONS = {
  pending: <Clock className="h-4 w-4 text-amber-500" />,
  accepted: <Check className="h-4 w-4 text-green-500" />,
  expired: <XCircle className="h-4 w-4 text-muted-foreground" />,
  revoked: <XCircle className="h-4 w-4 text-red-500" />,
};

const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  accepted:
    'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  expired: 'bg-muted text-muted-foreground border-border',
  revoked: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
};

const DEFAULT_EXPIRES_IN_DAYS = 7;

export function InvitesClient({ tenantSlug }: InvitesClientProps) {
  const [invites, setInvites] = useState<InviteWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAllStatuses, setShowAllStatuses] = useState(false);
  const [rolesResult, setRolesResult] = useState<GetAvailableRolesResult | null>(null);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: '',
      roleId: undefined,
      firstName: '',
      lastName: '',
      message: '',
      expiresInDays: DEFAULT_EXPIRES_IN_DAYS,
    },
  });

  // Fetch invites
  const fetchInvites = useCallback(async () => {
    setIsLoading(true);
    const result = await listInvites(tenantSlug, {
      status: showAllStatuses ? 'all' : 'pending',
    });
    if (result.success && result.data) {
      setInvites(result.data.items);
    }
    setIsLoading(false);
  }, [tenantSlug, showAllStatuses]);

  /* eslint-disable react-hooks/set-state-in-effect -- Initial data fetch on mount; setState happens inside async callback */
  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const openInviteDialog = () => {
    form.reset({
      email: '',
      roleId: undefined,
      firstName: '',
      lastName: '',
      message: '',
      expiresInDays: DEFAULT_EXPIRES_IN_DAYS,
    });
    setError(null);
    setDialogOpen(true);
    getAvailableRoles(tenantSlug).then((res) => {
      const data = res.success ? res.data : undefined;
      if (data?.roles?.length) {
        setRolesResult(data);
        form.setValue('roleId', data.roles[0].id);
      } else if (data) {
        setRolesResult(data);
      }
    });
  };

  // Handle form submit
  const handleSubmit = async (values: InviteFormValues) => {
    setError(null);
    const input: CreateInviteInput = {
      email: values.email,
      roleId: values.roleId,
      firstName: values.firstName || undefined,
      lastName: values.lastName || undefined,
      message: values.message || undefined,
      expiresInDays: values.expiresInDays,
    };
    const result = await createInvite(tenantSlug, input);

    if (result.success) {
      setDialogOpen(false);
      form.reset({
        email: '',
        roleId: undefined,
        firstName: '',
        lastName: '',
        message: '',
        expiresInDays: DEFAULT_EXPIRES_IN_DAYS,
      });
      fetchInvites();
    } else {
      setError(result.error || 'Failed to create invite');
    }
  };

  // Handle copy URL
  const handleCopyUrl = async (invite: InviteWithDetails) => {
    await navigator.clipboard.writeText(invite.inviteUrl);
    setCopiedId(invite.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle revoke
  const handleRevoke = async (invite: InviteWithDetails) => {
    if (!confirm(`Are you sure you want to revoke the invitation for "${invite.email}"?`)) return;

    const result = await revokeInvite(tenantSlug, invite.id);
    if (result.success) {
      fetchInvites();
    } else {
      toast.error(result.error || 'Failed to revoke invite');
    }
  };

  // Handle resend
  const handleResend = async (invite: InviteWithDetails) => {
    const result = await resendInvite(tenantSlug, invite.id);
    if (result.success) {
      fetchInvites();
    } else {
      toast.error(result.error || 'Failed to resend invite');
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(date));
  };

  // Time until expiration
  const getExpirationText = (expiresAt: Date) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();

    if (diffMs <= 0) return 'Expired';

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) return `Expires in ${diffDays}d ${diffHours}h`;
    if (diffHours > 0) return `Expires in ${diffHours}h`;
    return 'Expires soon';
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Invitations"
        description="Invite new members to your organization with personalized onboarding URLs"
        backHref={`/t/${tenantSlug}/admin`}
        backLabel="Admin"
        actionLabel="Create Invitation"
        onAction={openInviteDialog}
      />

      {/* Filter toggle */}
      <div className="flex items-center gap-2">
        <Button variant={!showAllStatuses ? 'default' : 'outline'} size="sm" onClick={() => setShowAllStatuses(false)}>
          Pending Only
        </Button>
        <Button variant={showAllStatuses ? 'default' : 'outline'} size="sm" onClick={() => setShowAllStatuses(true)}>
          All Invitations
        </Button>
      </div>

      {/* Invitations list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : invites.length === 0 ? (
        <Card className="rounded-xl border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No invitations found</h3>
            <p className="text-muted-foreground mb-4">
              {showAllStatuses
                ? 'No invitations have been created yet.'
                : 'No pending invitations. Create one to invite new members.'}
            </p>
            <Button onClick={openInviteDialog}>
              <Mail className="h-4 w-4 mr-2" />
              Create Invitation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {invites.map((invite) => (
            <Card
              key={invite.id}
              className={`rounded-xl border-0 shadow-md transition-all duration-300 ${invite.status === 'pending' ? 'border-2 border-primary/30' : ''}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                      {(invite.firstName || invite.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {invite.firstName && invite.lastName ? `${invite.firstName} ${invite.lastName}` : invite.email}
                      </CardTitle>
                      <CardDescription>{invite.email}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`${ROLE_COLORS[invite.role]} capitalize`}>
                      {invite.roleName ?? invite.role}
                    </Badge>
                    <Badge variant="outline" className={`${STATUS_COLORS[invite.status]} flex items-center gap-1`}>
                      {STATUS_ICONS[invite.status]}
                      <span className="capitalize">{invite.status}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {invite.status === 'pending' && (
                  <>
                    {/* Invite URL */}
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <code className="text-xs flex-1 truncate font-mono">{invite.inviteUrl}</code>
                      <Button variant="ghost" size="sm" onClick={() => handleCopyUrl(invite)} className="shrink-0">
                        {copiedId === invite.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Expiration */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{getExpirationText(invite.expiresAt)}</span>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleResend(invite)}>
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Extend
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRevoke(invite)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Revoke
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                  <span>Created {formatDate(invite.createdAt)}</span>
                  {invite.invitedBy && <span>by {invite.invitedBy.name || invite.invitedBy.email}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create invite dialog */}
      <AdminFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setError(null);
        }}
        title="Create Invitation"
        description="Generate a personalized onboarding link for a new team member"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(handleSubmit)(e);
        }}
        isSubmitting={form.formState.isSubmitting}
        submitLabel="Create & Copy Link"
      >
        <Form {...form}>
          <div className="space-y-4">
            {error && (
              <div
                id="invite-error"
                role="alert"
                aria-live="polite"
                className="rounded-lg bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-300"
              >
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="new.member@company.com"
                      aria-required="true"
                      aria-invalid={!!error}
                      aria-describedby={error ? 'invite-error' : undefined}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  {rolesResult?.roles?.length ? (
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(v) => field.onChange(v || undefined)}
                      aria-label="Select role for invited member"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rolesResult.roles.map((r: { id: string; name: string }) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground">Loading roles…</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiresInDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Expiration</FormLabel>
                  <Select
                    value={String(field.value)}
                    onValueChange={(v) => field.onChange(Number(v))}
                    aria-label="Select link expiration time"
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Welcome Message (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Welcome to our team! Please complete your profile..."
                      rows={3}
                      aria-label="Optional welcome message for the invited member"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>
      </AdminFormDialog>
    </div>
  );
}
