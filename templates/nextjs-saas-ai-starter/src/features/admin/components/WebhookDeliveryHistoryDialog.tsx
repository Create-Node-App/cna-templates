'use client';

/**
 * Dialog showing recent webhook delivery attempts for an endpoint.
 */

import { AlertCircle, CheckCircle2, Clock, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';

import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  ScrollArea,
} from '@/shared/components/ui';

import { getWebhookDeliveries, type WebhookDeliveryOutput } from '../services/webhook-admin-service';

interface WebhookDeliveryHistoryDialogProps {
  tenantSlug: string;
  endpointId: string;
  endpointName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function WebhookDeliveryHistoryDialog({
  tenantSlug,
  endpointId,
  endpointName,
  isOpen,
  onClose,
}: WebhookDeliveryHistoryDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [deliveries, setDeliveries] = useState<WebhookDeliveryOutput[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchDeliveries = () => {
    startTransition(async () => {
      setError(null);
      const result = await getWebhookDeliveries(tenantSlug, endpointId, 50);

      if (result.success) {
        setDeliveries(result.data);
      } else {
        setError(result.error);
      }
    });
  };

  useEffect(() => {
    if (isOpen) {
      fetchDeliveries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, endpointId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'retrying':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Success
          </Badge>
        );
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'retrying':
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-600">
            Retrying
          </Badge>
        );
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(date));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Delivery History</DialogTitle>
          <DialogDescription>Recent webhook deliveries for &quot;{endpointName}&quot;</DialogDescription>
        </DialogHeader>

        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={fetchDeliveries} disabled={isPending}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && <div className="p-4 rounded bg-destructive/10 text-destructive text-sm">{error}</div>}

        {isPending && deliveries.length === 0 ? (
          <div className="py-12 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Loading deliveries...</p>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No delivery history yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Deliveries will appear here when events are sent to this webhook.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {deliveries.map((delivery) => (
                <div key={delivery.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(delivery.status)}
                      <Badge variant="secondary" className="text-xs">
                        {delivery.eventType}
                      </Badge>
                      {getStatusBadge(delivery.status)}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(delivery.createdAt)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">HTTP Status:</span>{' '}
                      <span
                        className={
                          delivery.responseStatus && delivery.responseStatus < 400 ? 'text-green-600' : 'text-red-600'
                        }
                      >
                        {delivery.responseStatus ?? 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>{' '}
                      {delivery.durationMs ? `${delivery.durationMs}ms` : 'N/A'}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Attempts:</span> {delivery.attempts}
                    </div>
                  </div>

                  {delivery.errorMessage && (
                    <div className="text-xs p-2 bg-destructive/10 text-destructive rounded">
                      {delivery.errorMessage}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
