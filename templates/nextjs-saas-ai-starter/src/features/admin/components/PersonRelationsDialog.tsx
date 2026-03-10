'use client';

import { Loader2, Plus, Trash2, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui';
import { useToast } from '@/shared/components/ui/toast';

interface Person {
  id: string;
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
}

interface Relation {
  id: string;
  relationType: 'manager' | 'mentor' | 'teacher' | 'one_to_one';
  relatedPerson?: Person;
  person?: Person;
  startDate: string;
  endDate: string | null;
  notes: string | null;
}

interface RelationsData {
  asSubject: Relation[];
  asRelated: Relation[];
}

interface PersonRelationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantSlug: string;
  personId: string;
  personName: string;
  availablePersons: Person[];
}

export function PersonRelationsDialog({
  open,
  onOpenChange,
  tenantSlug,
  personId,
  personName,
  availablePersons,
}: PersonRelationsDialogProps) {
  const t = useTranslations('admin');
  const { toast } = useToast();

  const [relations, setRelations] = useState<RelationsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [newRelationType, setNewRelationType] = useState<'manager' | 'mentor' | 'teacher' | 'one_to_one'>('manager');
  const [newRelatedPersonId, setNewRelatedPersonId] = useState('');

  const fetchRelations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tenants/${tenantSlug}/admin/persons/${personId}/relations`);
      if (res.ok) {
        const data = await res.json();
        setRelations(data);
      }
    } catch (error) {
      console.error('Error fetching relations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [tenantSlug, personId]);

  useEffect(() => {
    if (open) {
      void fetchRelations();
    }
  }, [open, fetchRelations]);

  const handleAddRelation = async () => {
    if (!newRelatedPersonId) return;

    setIsAdding(true);
    try {
      const res = await fetch(`/api/tenants/${tenantSlug}/admin/persons/${personId}/relations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relatedPersonId: newRelatedPersonId,
          relationType: newRelationType,
        }),
      });

      if (res.ok) {
        toast({ title: t('relationAdded') });
        setNewRelatedPersonId('');
        void fetchRelations();
      } else {
        const data = await res.json();
        toast({ title: t('error'), description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: t('error'), description: t('failedToAddRelation'), variant: 'destructive' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteRelation = async (relationId: string) => {
    try {
      const res = await fetch(`/api/tenants/${tenantSlug}/admin/persons/${personId}/relations`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relationId }),
      });

      if (res.ok) {
        toast({ title: t('relationRemoved') });
        void fetchRelations();
      } else {
        const data = await res.json();
        toast({ title: t('error'), description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: t('error'), description: t('failedToRemoveRelation'), variant: 'destructive' });
    }
  };

  const getRelationLabel = (type: string) => {
    switch (type) {
      case 'manager':
        return t('relationType.manager');
      case 'mentor':
        return t('relationType.mentor');
      case 'teacher':
        return t('relationType.teacher');
      case 'one_to_one':
        return t('relationType.one_to_one');
      default:
        return type;
    }
  };

  const filteredPersons = availablePersons.filter((p) => p.id !== personId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('relationsFor')} {personName}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Add New Relation */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium">{t('addRelation')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('relationType.label')}</Label>
                  <Select
                    value={newRelationType}
                    onValueChange={(v) => setNewRelationType(v as typeof newRelationType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">{t('relationType.manager')}</SelectItem>
                      <SelectItem value="mentor">{t('relationType.mentor')}</SelectItem>
                      <SelectItem value="teacher">{t('relationType.teacher')}</SelectItem>
                      <SelectItem value="one_to_one">{t('relationType.one_to_one')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('selectPerson')}</Label>
                  <Select value={newRelatedPersonId} onValueChange={setNewRelatedPersonId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectPersonPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredPersons.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.displayName ?? person.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAddRelation} disabled={isAdding || !newRelatedPersonId}>
                {isAdding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                {t('addRelation')}
              </Button>
            </div>

            {/* Current Relations - as subject */}
            {relations && relations.asSubject.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium">{t('theirRelations')}</h3>
                {relations.asSubject.map((rel) => (
                  <div key={rel.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{getRelationLabel(rel.relationType)}</Badge>
                      {rel.relatedPerson && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={rel.relatedPerson.avatarUrl ?? undefined} />
                            <AvatarFallback>
                              {(rel.relatedPerson.displayName ?? rel.relatedPerson.email).slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{rel.relatedPerson.displayName ?? rel.relatedPerson.email}</span>
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteRelation(rel.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Relations where they are the manager/mentor */}
            {relations && relations.asRelated.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium">{t('managingRelations')}</h3>
                {relations.asRelated.map((rel) => (
                  <div key={rel.id} className="flex items-center justify-between border rounded-lg p-3 bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">
                        {getRelationLabel(rel.relationType)} {t('of')}
                      </Badge>
                      {rel.person && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={rel.person.avatarUrl ?? undefined} />
                            <AvatarFallback>
                              {(rel.person.displayName ?? rel.person.email).slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{rel.person.displayName ?? rel.person.email}</span>
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteRelation(rel.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {relations && relations.asSubject.length === 0 && relations.asRelated.length === 0 && (
              <p className="text-center text-muted-foreground py-4">{t('noRelations')}</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
