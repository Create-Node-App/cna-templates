'use client';

/**
 * Roles & Permissions Admin Client
 *
 * Lists roles, allows create/edit/delete and permission assignment.
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Shield, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AdminPageHeader } from '@/features/admin';
import {
  createRole,
  deleteRole,
  listPermissions,
  listRoles,
  updateRole,
} from '@/features/admin/services/roles-service';
import type { PermissionForTenant, RoleWithPermissions } from '@/features/admin/services/roles-service';
import { Badge, Button, Checkbox, Input } from '@/shared/components/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { useToast } from '@/shared/components/ui/toast';

const roleFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  isSystem: z.boolean(),
  permissionIds: z.array(z.string()),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

interface RolesClientProps {
  tenantSlug: string;
  initialRoles: RoleWithPermissions[];
  initialPermissions: PermissionForTenant[];
  /** When false, custom role creation is disabled; only system roles can be edited */
  allowCustomRoles?: boolean;
}

export function RolesClient({
  tenantSlug,
  initialRoles,
  initialPermissions,
  allowCustomRoles = true,
}: RolesClientProps) {
  const { toast } = useToast();
  const [roles, setRoles] = useState<RoleWithPermissions[]>(initialRoles);
  const [permissions, setPermissions] = useState<PermissionForTenant[]>(initialPermissions);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RoleWithPermissions | null>(null);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      isSystem: false,
      permissionIds: [],
    },
  });

  const fetchData = useCallback(async () => {
    const [rolesRes, permsRes] = await Promise.all([listRoles(tenantSlug), listPermissions(tenantSlug)]);
    if (rolesRes.success && rolesRes.data) setRoles(rolesRes.data);
    if (permsRes.success && permsRes.data) setPermissions(permsRes.data);
  }, [tenantSlug]);

  const openDialog = useCallback(
    (role: RoleWithPermissions | null) => {
      setEditing(role);
      if (role) {
        form.reset({
          name: role.name,
          slug: role.slug,
          description: role.description ?? '',
          isSystem: role.isSystem,
          permissionIds: role.permissionIds,
        });
      } else {
        form.reset({
          name: '',
          slug: '',
          description: '',
          isSystem: false,
          permissionIds: [],
        });
      }
      setDialogOpen(true);
    },
    [form],
  );

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) setEditing(null);
  }, []);

  const handleSubmit = async (values: RoleFormValues) => {
    if (editing) {
      const result = await updateRole(tenantSlug, editing.id, {
        name: values.name,
        slug: values.slug,
        description: values.description || undefined,
        permissionIds: values.permissionIds,
      });
      if (result.success) {
        toast({ title: 'Role updated' });
        setDialogOpen(false);
        fetchData();
      } else {
        toast({ title: result.error, variant: 'destructive' });
      }
    } else {
      const result = await createRole(tenantSlug, values);
      if (result.success) {
        toast({ title: 'Role created' });
        setDialogOpen(false);
        fetchData();
      } else {
        toast({ title: result.error, variant: 'destructive' });
      }
    }
  };

  const handleDelete = async (role: RoleWithPermissions) => {
    if (role.isSystem) {
      toast({ title: 'Cannot delete system role', variant: 'destructive' });
      return;
    }
    if (!confirm(`Delete role "${role.name}"?`)) return;
    const result = await deleteRole(tenantSlug, role.id);
    if (result.success) {
      toast({ title: 'Role deleted' });
      fetchData();
    } else {
      toast({ title: result.error, variant: 'destructive' });
    }
  };

  const togglePermission = (permId: string, currentIds: string[]) => {
    form.setValue(
      'permissionIds',
      currentIds.includes(permId) ? currentIds.filter((id) => id !== permId) : [...currentIds, permId],
    );
  };

  const byCategory = permissions.reduce(
    (acc, p) => {
      const cat = p.category ?? 'other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(p);
      return acc;
    },
    {} as Record<string, PermissionForTenant[]>,
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Roles & Permissions"
        description="Manage tenant roles and their permissions. Members can be assigned one or more roles."
      >
        {allowCustomRoles ? (
          <Button onClick={() => openDialog(null)}>
            <Plus className="mr-2 h-4 w-4" />
            Add role
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">Custom roles are disabled for this organization.</p>
        )}
      </AdminPageHeader>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Slug</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Permissions</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{role.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{role.slug}</td>
                  <td className="px-4 py-3">
                    {role.isSystem ? (
                      <Badge variant="secondary" className="gap-1">
                        <Shield className="h-3 w-3" />
                        System
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">Custom</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{role.permissionKeys.length}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => openDialog(role)} aria-label="Edit role">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {!role.isSystem && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(role)}
                        aria-label="Delete role"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {roles.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No roles yet. Run the seed or add a role to get started.
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit role' : 'Add role'}</DialogTitle>
            <DialogDescription>
              {editing?.isSystem
                ? 'System roles can only have their permissions edited.'
                : 'Create a custom role and assign permissions.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. People Partner" disabled={editing?.isSystem} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. people-partner"
                        disabled={editing?.isSystem}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!editing?.isSystem && (
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Short description" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="permissionIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permissions</FormLabel>
                    <FormControl>
                      <div className="max-h-48 space-y-3 overflow-y-auto rounded border p-3">
                        {Object.entries(byCategory).map(([category, perms]) => (
                          <div key={category}>
                            <p className="mb-1 text-xs font-medium text-muted-foreground capitalize">{category}</p>
                            <div className="flex flex-wrap gap-2">
                              {perms.map((p) => (
                                <label key={p.id} className="flex items-center gap-2 text-sm">
                                  <Checkbox
                                    checked={field.value?.includes(p.id) ?? false}
                                    onCheckedChange={() => togglePermission(p.id, field.value ?? [])}
                                  />
                                  <span>{p.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {editing ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
