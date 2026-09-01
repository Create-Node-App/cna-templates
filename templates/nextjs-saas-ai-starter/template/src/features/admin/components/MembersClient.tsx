'use client';

/**
 * Team Members Admin Page Client
 *
 * Client component for managing team members with invite, role change, removal, and relations (manager, 1:1er, mentor, teacher).
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { AdminDataTable, AdminFormDialog, AdminPageHeader } from '@/features/admin';
import type { Column } from '@/features/admin/components/AdminDataTable';
import {
  getAvailableRoles,
  getMemberRoleIds,
  inviteMember,
  listMembers,
  removeMember,
  updateMember,
} from '@/features/admin/services/members-service';
import type { GetAvailableRolesResult, MemberWithDetails, PaginatedResult, TenantRole } from '@/features/admin/types';
import { Input } from '@/shared/components/ui';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';

interface MembersClientProps {
  tenantSlug: string;
  initialData: PaginatedResult<MemberWithDetails>;
  currentUserId: string;
}

const ROLE_COLORS: Record<TenantRole, string> = {
  admin: 'bg-purple-100 text-purple-800',
  manager: 'bg-blue-100 text-blue-800',
  member: 'bg-muted text-foreground',
};

const memberFormSchema = z.object({
  email: z.string().optional(),
  name: z.string().optional(),
  roleIds: z.array(z.string()),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

export function MembersClient({ tenantSlug, initialData, currentUserId }: MembersClientProps) {
  const t = useTranslations('members');
  const tCommon = useTranslations('common');
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MemberWithDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Available roles from DB
  const [rolesResult, setRolesResult] = useState<GetAvailableRolesResult | null>(null);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      email: '',
      name: '',
      roleIds: [],
    },
  });

  // Fetch data
  const fetchData = useCallback(
    async (page = 1, search = '') => {
      setIsLoading(true);
      const result = await listMembers(tenantSlug, { page, search });
      if (result.success && result.data) {
        setData(result.data);
      }
      setIsLoading(false);
    },
    [tenantSlug],
  );

  // Fetch roles when dialog opens
  const fetchRoles = useCallback(async () => {
    const result = await getAvailableRoles(tenantSlug);
    if (result.success && result.data) {
      setRolesResult(result.data);
    }
  }, [tenantSlug]);

  // When dialog opens: sync reset + fetch roles; when editing, fetch member roleIds (async)
  const openDialog = (editingMember: MemberWithDetails | null) => {
    setEditing(editingMember);
    setError(null);
    if (editingMember) {
      form.reset({
        email: editingMember.user.email || '',
        name: editingMember.user.name || '',
        roleIds: [],
      });
    } else {
      form.reset({
        email: '',
        name: '',
        roleIds: [],
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setError(null);
    form.reset({
      email: '',
      name: '',
      roleIds: [],
    });
  };

  useEffect(() => {
    if (!dialogOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetchRoles callback
    fetchRoles();
    if (editing) {
      getAvailableRoles(tenantSlug).then((res) => {
        if (res.success && res.data?.roles?.length) {
          getMemberRoleIds(tenantSlug, editing.id).then((idsRes) => {
            if (idsRes.success && idsRes.data) {
              form.reset({
                email: editing.user.email || '',
                name: editing.user.name || '',
                roleIds: idsRes.data ?? [],
              });
            }
          });
        }
      });
    }
  }, [dialogOpen, editing, fetchRoles, tenantSlug, form]);

  // Handle form submit
  const handleSubmit = async (values: MemberFormValues) => {
    if (!editing) {
      const email = (values.email ?? '').trim();
      if (!email) {
        form.setError('email', { type: 'manual', message: 'Email is required' });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        form.setError('email', { type: 'manual', message: 'Enter a valid email' });
        return;
      }
    }
    setError(null);

    try {
      let result;
      if (editing) {
        result = await updateMember(tenantSlug, editing.id, {
          roleIds: values.roleIds?.length ? values.roleIds : undefined,
          role: editing.role as import('@/shared/db/schema/auth').TenantRole,
        });
      } else {
        const firstRoleSlug =
          values.roleIds?.length && rolesResult?.roles
            ? rolesResult.roles.find((r) => r.id === values.roleIds![0])?.slug
            : undefined;
        const roleForInvite: TenantRole =
          firstRoleSlug === 'admin' || firstRoleSlug === 'manager' || firstRoleSlug === 'member'
            ? firstRoleSlug
            : 'member';
        result = await inviteMember(tenantSlug, {
          email: (values.email ?? '').trim(),
          name: (values.name ?? '').trim() || undefined,
          role: roleForInvite,
        });
      }

      if (result.success) {
        setDialogOpen(false);
        fetchData(data.page);
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch {
      setError('An error occurred');
    }
  };

  // Handle remove
  const handleRemove = async (member: MemberWithDetails) => {
    if (member.userId === currentUserId) {
      toast.error('You cannot remove yourself from the organization');
      return;
    }

    if (!confirm(`Are you sure you want to remove "${member.user.name || member.user.email}"?`)) return;

    const result = await removeMember(tenantSlug, member.id);
    if (result.success) {
      fetchData(data.page);
    } else {
      toast.error(result.error || 'Failed to remove member');
    }
  };

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return '—';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  // Table columns
  const columns: Column<MemberWithDetails>[] = [
    {
      key: 'user',
      header: 'Member',
      render: (member) => (
        <div className="flex items-center gap-3">
          {member.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={member.user.image} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
              {(member.user.name || member.user.email || '?')[0].toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium">{member.user.name || 'No name'}</p>
            <p className="text-xs text-muted-foreground">{member.user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (member) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${ROLE_COLORS[member.role as TenantRole] ?? ROLE_COLORS.member}`}
        >
          {member.role}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (member) => <span className="text-sm text-muted-foreground">{formatDate(member.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('title')}
        description={t('description')}
        backHref={`/t/${tenantSlug}/admin`}
        backLabel="Admin"
        actionLabel={t('inviteMember')}
        onAction={() => openDialog(null)}
      />

      <AdminDataTable
        columns={columns}
        data={data.items}
        total={data.total}
        page={data.page}
        pageSize={data.pageSize}
        totalPages={data.totalPages}
        isLoading={isLoading}
        searchPlaceholder={t('searchPlaceholder')}
        onSearch={(search) => fetchData(1, search)}
        onPageChange={(page) => fetchData(page)}
        onRowClick={(member) => openDialog(member)}
        onDelete={(member) => handleRemove(member)}
        getRowKey={(member) => member.id}
        emptyMessage={t('noMembers')}
      />

      <AdminFormDialog
        open={dialogOpen}
        onClose={closeDialog}
        title={editing ? t('editMember') : t('inviteMember')}
        description={t('description')}
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(handleSubmit)(e);
        }}
        isSubmitting={form.formState.isSubmitting}
        submitLabel={editing ? tCommon('update') : tCommon('submit')}
      >
        <Form {...form}>
          <div className="space-y-4">
            {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            {!editing && (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="colleague@company.com" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder={t('namePlaceholder')} {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {rolesResult?.roles?.length ? (
              <FormField
                control={form.control}
                name="roleIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roles (select one or more)</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-3 rounded-md border border-input bg-background p-3">
                        {rolesResult.roles.map((r: { id: string; name: string }) => (
                          <label key={r.id} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={field.value?.includes(r.id) ?? false}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.checked
                                    ? [...(field.value ?? []), r.id]
                                    : (field.value ?? []).filter((id: string) => id !== r.id),
                                )
                              }
                              disabled={editing?.userId === currentUserId}
                              className="h-4 w-4 rounded border-input"
                            />
                            <span>{r.name}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                    {editing?.userId === currentUserId && (
                      <p className="text-xs text-yellow-600">You cannot change your own roles</p>
                    )}
                  </FormItem>
                )}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Loading roles…</p>
            )}
          </div>
        </Form>
      </AdminFormDialog>
    </div>
  );
}
