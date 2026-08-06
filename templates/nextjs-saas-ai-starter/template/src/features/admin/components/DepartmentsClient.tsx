'use client';

/**
 * Admin Departments Client
 *
 * List departments, create/edit/delete via API, assign/remove managers and members.
 * Uses GET/POST/PUT/DELETE departments and departments/[id]/managers, departments/[id]/members.
 */

import { Building2, ChevronDown, ChevronRight, Loader2, Pencil, Plus, Trash2, UserPlus, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { listTenantPersonsForRelations } from '@/features/admin/services/members-service';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { cn } from '@/shared/lib/utils';
import type { DepartmentWithMembers } from '@/shared/services/department-service';

interface DepartmentManager {
  id: string;
  managerId: string;
  managerName: string | null;
  managerEmail: string;
  isPrimary: boolean;
  startDate: Date;
  endDate: Date | null;
}

interface DepartmentMember {
  id: string;
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
  title: string | null;
  departmentId: string | null;
}

interface PersonOption {
  id: string;
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
}

interface DepartmentsClientProps {
  tenantSlug: string;
  initialDepartments: DepartmentWithMembers[];
}

export function DepartmentsClient({ tenantSlug, initialDepartments }: DepartmentsClientProps) {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const [departments, setDepartments] = useState<DepartmentWithMembers[]>(initialDepartments);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [details, setDetails] = useState<{
    managers: DepartmentManager[];
    members: DepartmentMember[];
  } | null>(null);
  const [loadingDetailsId, setLoadingDetailsId] = useState<string | null>(null);
  const [persons, setPersons] = useState<PersonOption[]>([]);
  const [_loadingPersons, setLoadingPersons] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [createName, setCreateName] = useState('');
  const [createParentId, setCreateParentId] = useState<string>('');
  const [createDescription, setCreateDescription] = useState('');
  const [editName, setEditName] = useState('');
  const [editParentId, setEditParentId] = useState<string>('');
  const [editDescription, setEditDescription] = useState('');

  const base = `/api/tenants/${tenantSlug}/departments`;

  const refetchDepartments = useCallback(async () => {
    try {
      const res = await fetch(`${base}?withDetails=true`);
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.departments ?? []);
      }
    } catch {
      setError('Failed to refresh departments');
    }
  }, [base]);

  const fetchDetails = useCallback(
    async (departmentId: string) => {
      setLoadingDetailsId(departmentId);
      setError(null);
      try {
        const res = await fetch(`${base}/${departmentId}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? 'Failed to load department details');
        }
        const data = await res.json();
        setDetails({ managers: data.managers ?? [], members: data.members ?? [] });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
        setDetails(null);
      } finally {
        setLoadingDetailsId(null);
      }
    },
    [base],
  );

  const loadPersons = useCallback(async () => {
    setLoadingPersons(true);
    const result = await listTenantPersonsForRelations(tenantSlug);
    if (result.success && result.data) {
      setPersons(result.data);
    }
    setLoadingPersons(false);
  }, [tenantSlug]);

  useEffect(() => {
    if (expandedId) {
      fetchDetails(expandedId);
      void loadPersons();
    } else {
      setDetails(null);
    }
  }, [expandedId, fetchDetails, loadPersons]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const addManager = async (departmentId: string, managerId: string, isPrimary: boolean) => {
    setActionLoading(`add-manager-${departmentId}`);
    setError(null);
    try {
      const res = await fetch(`${base}/${departmentId}/managers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerId, isPrimary }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to add manager');
      }
      if (expandedId === departmentId) await fetchDetails(departmentId);
      setDepartments((prev) =>
        prev.map((d) => (d.id === departmentId ? { ...d, managerIds: [...(d.managerIds ?? []), managerId] } : d)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add manager');
    } finally {
      setActionLoading(null);
    }
  };

  const removeManager = async (departmentId: string, departmentManagerId: string) => {
    setActionLoading(`remove-manager-${departmentManagerId}`);
    setError(null);
    try {
      const res = await fetch(`${base}/${departmentId}/managers`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departmentManagerId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to remove manager');
      }
      if (expandedId === departmentId) await fetchDetails(departmentId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove manager');
    } finally {
      setActionLoading(null);
    }
  };

  const addMember = async (departmentId: string, personId: string) => {
    setActionLoading(`add-member-${departmentId}`);
    setError(null);
    try {
      const res = await fetch(`${base}/${departmentId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to add member');
      }
      if (expandedId === departmentId) await fetchDetails(departmentId);
      setDepartments((prev) =>
        prev.map((d) => (d.id === departmentId ? { ...d, memberCount: (d.memberCount ?? 0) + 1 } : d)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add member');
    } finally {
      setActionLoading(null);
    }
  };

  const removeMember = async (departmentId: string, personId: string) => {
    setActionLoading(`remove-member-${personId}`);
    setError(null);
    try {
      const res = await fetch(`${base}/${departmentId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to remove member');
      }
      if (expandedId === departmentId) await fetchDetails(departmentId);
      setDepartments((prev) =>
        prev.map((d) => (d.id === departmentId ? { ...d, memberCount: Math.max(0, (d.memberCount ?? 1) - 1) } : d)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove member');
    } finally {
      setActionLoading(null);
    }
  };

  const currentManagersIds = details?.managers?.map((m) => m.managerId) ?? [];
  const currentMembersIds = details?.members?.map((m) => m.id) ?? [];
  const availableForManager = persons.filter((p) => !currentManagersIds.includes(p.id));
  const availableForMember = persons.filter((p) => !currentMembersIds.includes(p.id));

  const handleCreateDepartment = async () => {
    if (!createName.trim()) return;
    setActionLoading('create');
    setError(null);
    try {
      const res = await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createName.trim(),
          parentId: createParentId || undefined,
          description: createDescription.trim() || undefined,
          sortOrder: departments.length,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to create department');
      }
      setCreateDialogOpen(false);
      setCreateName('');
      setCreateParentId('');
      setCreateDescription('');
      await refetchDepartments();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create department');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateDepartment = async (departmentId: string) => {
    setActionLoading(`edit-${departmentId}`);
    setError(null);
    try {
      const res = await fetch(`${base}/${departmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          parentId: editParentId || undefined,
          description: editDescription.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to update department');
      }
      setEditingDeptId(null);
      await refetchDepartments();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update department');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    if (!confirm(t('departmentsConfirmDelete', { defaultValue: 'Delete this department? This cannot be undone.' })))
      return;
    setActionLoading(`delete-${departmentId}`);
    setError(null);
    try {
      const res = await fetch(`${base}/${departmentId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to delete department');
      }
      setEditingDeptId(null);
      if (expandedId === departmentId) setExpandedId(null);
      await refetchDepartments();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete department');
    } finally {
      setActionLoading(null);
    }
  };

  const openEdit = (dept: DepartmentWithMembers) => {
    setEditingDeptId(dept.id);
    setEditName(dept.name);
    setEditParentId(dept.parentId ?? '');
    setEditDescription(dept.description ?? '');
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      <p className="text-sm text-muted-foreground">{t('departmentsPageDescription')}</p>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t('departments')}
            </h2>
            <Button size="sm" onClick={() => setCreateDialogOpen(true)} disabled={!!actionLoading}>
              <Plus className="h-4 w-4 mr-1" />
              {t('departmentsAddDepartment', { defaultValue: 'Add department' })}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {departments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Building2 className="h-12 w-12 mb-3 opacity-50" />
              <p>{t('departmentsNoDepartments', { defaultValue: 'No departments configured' })}</p>
              <p className="text-sm">
                {t('departmentsNoDepartmentsHint', { defaultValue: 'Add a department to organize your team.' })}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setCreateDialogOpen(true)}
                disabled={!!actionLoading}
              >
                <Plus className="h-4 w-4 mr-1" />
                {t('departmentsAddDepartment', { defaultValue: 'Add department' })}
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {departments.map((dept) => (
                <li key={dept.id}>
                  <button
                    type="button"
                    onClick={() => toggleExpand(dept.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-accent/50',
                    )}
                    aria-expanded={expandedId === dept.id}
                  >
                    {expandedId === dept.id ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="font-medium">{dept.name}</span>
                    {dept.description ? (
                      <span className="max-w-[420px] truncate text-sm text-muted-foreground">{dept.description}</span>
                    ) : null}
                    <span className="text-muted-foreground text-sm">
                      {dept.memberCount ?? 0} {t('departmentsMembers', { defaultValue: 'members' })} ·{' '}
                      {dept.managerIds?.length ?? 0} {t('departmentsManagers', { defaultValue: 'managers' })}
                    </span>
                    <div className="ml-auto flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(dept)}
                        disabled={!!actionLoading}
                        aria-label={t('departmentsEdit', { defaultValue: 'Edit department' })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteDepartment(dept.id)}
                        disabled={!!actionLoading || (dept.memberCount ?? 0) > 0}
                        aria-label={t('departmentsDelete', { defaultValue: 'Delete department' })}
                        title={
                          (dept.memberCount ?? 0) > 0
                            ? t('departmentsDeleteDisabledHint', { defaultValue: 'Remove all members first' })
                            : undefined
                        }
                      >
                        {actionLoading === `delete-${dept.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </button>

                  {expandedId === dept.id && (
                    <div className="border-t border-border bg-muted/30 px-4 py-4">
                      {loadingDetailsId === dept.id ? (
                        <div className="flex items-center gap-2 py-4 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>{tCommon('loading')}</span>
                        </div>
                      ) : (
                        <div className="grid gap-6 sm:grid-cols-2">
                          {/* Managers */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-sm font-medium flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {t('departmentsManagers', { defaultValue: 'Managers' })}
                              </Label>
                              {availableForManager.length > 0 && (
                                <Select
                                  onValueChange={(managerId) => {
                                    addManager(dept.id, managerId, (details?.managers?.length ?? 0) === 0);
                                  }}
                                >
                                  <SelectTrigger className="w-[200px] h-8" disabled={!!actionLoading}>
                                    <SelectValue placeholder={t('departmentsAddManager')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableForManager.map((p) => (
                                      <SelectItem key={p.id} value={p.id}>
                                        {p.displayName || p.email}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                            <ul className="space-y-2">
                              {details?.managers?.length ? (
                                details.managers.map((m) => (
                                  <li
                                    key={m.id}
                                    className="flex items-center justify-between rounded-md border bg-card px-3 py-2"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">{m.managerName || m.managerEmail}</span>
                                      {m.isPrimary && (
                                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                                          {t('departmentsPrimary', { defaultValue: 'Primary' })}
                                        </span>
                                      )}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:text-destructive"
                                      onClick={() => removeManager(dept.id, m.id)}
                                      disabled={actionLoading !== null}
                                      aria-label={t('departmentsRemoveManager', { defaultValue: 'Remove manager' })}
                                    >
                                      {actionLoading === `remove-manager-${m.id}` ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </li>
                                ))
                              ) : (
                                <li className="text-sm text-muted-foreground py-2">
                                  {t('departmentsNoManagers', { defaultValue: 'No managers assigned' })}
                                </li>
                              )}
                            </ul>
                          </div>

                          {/* Members */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-sm font-medium flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                {t('departmentsMembers', { defaultValue: 'Members' })}
                              </Label>
                              {availableForMember.length > 0 && (
                                <Select onValueChange={(personId) => addMember(dept.id, personId)}>
                                  <SelectTrigger className="w-[200px] h-8" disabled={!!actionLoading}>
                                    <SelectValue placeholder={t('departmentsAddMember')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableForMember.map((p) => (
                                      <SelectItem key={p.id} value={p.id}>
                                        {p.displayName || p.email}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                            <ul className="space-y-2">
                              {details?.members?.length ? (
                                details.members.map((mem) => (
                                  <li
                                    key={mem.id}
                                    className="flex items-center justify-between rounded-md border bg-card px-3 py-2"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage src={mem.avatarUrl ?? undefined} alt="" />
                                        <AvatarFallback className="text-xs">
                                          {(mem.displayName || mem.email).charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm font-medium">{mem.displayName || mem.email}</span>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:text-destructive"
                                      onClick={() => removeMember(dept.id, mem.id)}
                                      disabled={actionLoading !== null}
                                      aria-label={t('departmentsRemoveMember', { defaultValue: 'Remove member' })}
                                    >
                                      {actionLoading === `remove-member-${mem.id}` ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </li>
                                ))
                              ) : (
                                <li className="text-sm text-muted-foreground py-2">
                                  {t('departmentsNoMembers', { defaultValue: 'No members assigned' })}
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Create department dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('departmentsAddDepartment', { defaultValue: 'Add department' })}</DialogTitle>
            <DialogDescription>
              {t('departmentsCreateDescription', {
                defaultValue: 'Create a new department. You can set a parent department later.',
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="create-dept-name">{t('departmentsName', { defaultValue: 'Name' })}</Label>
              <Input
                id="create-dept-name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder={t('departmentsNamePlaceholder', { defaultValue: 'e.g. Engineering' })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-dept-parent">
                {t('departmentsParent', { defaultValue: 'Parent department' })}
              </Label>
              <Select
                value={createParentId || '__none__'}
                onValueChange={(v) => setCreateParentId(v === '__none__' ? '' : v)}
              >
                <SelectTrigger id="create-dept-parent">
                  <SelectValue placeholder={t('departmentsNoParent', { defaultValue: 'None' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{t('departmentsNoParent', { defaultValue: 'None' })}</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-dept-description">
                {t('departmentsDescription', { defaultValue: 'Description' })}
              </Label>
              <Input
                id="create-dept-description"
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder={t('departmentsDescriptionPlaceholder', { defaultValue: 'Optional description' })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleCreateDepartment} disabled={!createName.trim() || actionLoading === 'create'}>
              {actionLoading === 'create' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t('departmentsAddDepartment', { defaultValue: 'Add department' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit department dialog */}
      <Dialog open={!!editingDeptId} onOpenChange={(open) => !open && setEditingDeptId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('departmentsEditDepartment', { defaultValue: 'Edit department' })}</DialogTitle>
          </DialogHeader>
          {editingDeptId && (
            <>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-dept-name">{t('departmentsName', { defaultValue: 'Name' })}</Label>
                  <Input
                    id="edit-dept-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder={t('departmentsNamePlaceholder', { defaultValue: 'e.g. Engineering' })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dept-parent">
                    {t('departmentsParent', { defaultValue: 'Parent department' })}
                  </Label>
                  <Select
                    value={editParentId || '__none__'}
                    onValueChange={(v) => setEditParentId(v === '__none__' ? '' : v)}
                  >
                    <SelectTrigger id="edit-dept-parent">
                      <SelectValue placeholder={t('departmentsNoParent', { defaultValue: 'None' })} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">{t('departmentsNoParent', { defaultValue: 'None' })}</SelectItem>
                      {departments
                        .filter((d) => d.id !== editingDeptId)
                        .map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dept-description">
                    {t('departmentsDescription', { defaultValue: 'Description' })}
                  </Label>
                  <Input
                    id="edit-dept-description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder={t('departmentsDescriptionPlaceholder', { defaultValue: 'Optional description' })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingDeptId(null)}>
                  {tCommon('cancel')}
                </Button>
                <Button
                  onClick={() => handleUpdateDepartment(editingDeptId)}
                  disabled={!editName.trim() || actionLoading === `edit-${editingDeptId}`}
                >
                  {actionLoading === `edit-${editingDeptId}` ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {tCommon('save')}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
