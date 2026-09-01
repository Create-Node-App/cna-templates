'use client';

/**
 * Client component for managing webhook endpoints.
 */

import {
  Check,
  Copy,
  ExternalLink,
  History,
  Loader2,
  MoreHorizontal,
  Play,
  Plus,
  RefreshCw,
  Trash2,
  Webhook,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Switch,
} from '@/shared/components/ui';

import { WebhookDeliveryHistoryDialog } from './WebhookDeliveryHistoryDialog';
import { WebhookFormDialog } from './WebhookFormDialog';
import {
  deleteWebhookEndpoint,
  testWebhookEndpoint,
  toggleWebhookEndpoint,
  type WebhookEndpointOutput,
} from '../services/webhook-admin-service';

interface WebhooksClientProps {
  tenantSlug: string;
  initialEndpoints: WebhookEndpointOutput[];
  eventTypes: { value: string; label: string; category: string }[];
  isEnabled: boolean;
}

export function WebhooksClient({ tenantSlug, initialEndpoints, eventTypes, isEnabled }: WebhooksClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [endpoints, setEndpoints] = useState<WebhookEndpointOutput[]>(initialEndpoints);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<WebhookEndpointOutput | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyEndpoint, setHistoryEndpoint] = useState<WebhookEndpointOutput | null>(null);

  const handleToggle = (endpointId: string, enabled: boolean) => {
    // Optimistic update
    setEndpoints((prev) => prev.map((ep) => (ep.id === endpointId ? { ...ep, enabled } : ep)));

    startTransition(async () => {
      const result = await toggleWebhookEndpoint(tenantSlug, endpointId, enabled);
      if (!result.success) {
        // Revert on error
        setEndpoints((prev) => prev.map((ep) => (ep.id === endpointId ? { ...ep, enabled: !enabled } : ep)));
      }
    });
  };

  const handleDelete = (endpointId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteWebhookEndpoint(tenantSlug, endpointId);
      if (result.success) {
        setEndpoints((prev) => prev.filter((ep) => ep.id !== endpointId));
      }
    });
  };

  const handleEdit = (endpoint: WebhookEndpointOutput) => {
    setEditingEndpoint(endpoint);
    setFormOpen(true);
  };

  const handleViewHistory = (endpoint: WebhookEndpointOutput) => {
    setHistoryEndpoint(endpoint);
    setHistoryOpen(true);
  };

  const handleTest = (endpointId: string) => {
    setTestingId(endpointId);
    setTestResult(null);

    startTransition(async () => {
      const result = await testWebhookEndpoint(tenantSlug, endpointId);

      if (result.success) {
        setTestResult({
          id: endpointId,
          success: true,
          message: `Success! HTTP ${result.status} in ${result.durationMs}ms`,
        });
      } else {
        setTestResult({
          id: endpointId,
          success: false,
          message: result.error,
        });
      }

      setTestingId(null);

      // Clear result after 5 seconds
      setTimeout(() => {
        setTestResult((prev) => (prev?.id === endpointId ? null : prev));
      }, 5000);
    });
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingEndpoint(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    router.refresh();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const maskUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return `${parsed.protocol}//${parsed.host}/...`;
    } catch {
      return url.slice(0, 30) + '...';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Configured Webhooks</h2>
        <Button onClick={() => setFormOpen(true)} disabled={!isEnabled || isPending}>
          <Plus className="mr-2 h-4 w-4" />
          Add Webhook
        </Button>
      </div>

      {/* Endpoints list */}
      {endpoints.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Webhook className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No webhooks configured yet.</p>
            {isEnabled && (
              <Button className="mt-4" onClick={() => setFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create your first webhook
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {endpoints.map((endpoint) => (
            <Card key={endpoint.id} className={!endpoint.enabled ? 'opacity-60' : undefined}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={endpoint.enabled}
                      onCheckedChange={(checked) => handleToggle(endpoint.id, checked)}
                      disabled={isPending || !isEnabled}
                    />
                    <div>
                      <CardTitle className="text-base">{endpoint.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs">{maskUrl(endpoint.url)}</span>
                        <button
                          onClick={() => copyToClipboard(endpoint.url, endpoint.id)}
                          className="text-muted-foreground hover:text-foreground"
                          title="Copy URL"
                        >
                          {copiedId === endpoint.id ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleTest(endpoint.id)} disabled={testingId === endpoint.id}>
                        {testingId === endpoint.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="mr-2 h-4 w-4" />
                        )}
                        Send Test
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewHistory(endpoint)}>
                        <History className="mr-2 h-4 w-4" />
                        View History
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(endpoint)}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={endpoint.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open URL
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(endpoint.id, endpoint.name)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {endpoint.events.slice(0, 5).map((event) => (
                    <Badge key={event} variant="secondary" className="text-xs">
                      {event}
                    </Badge>
                  ))}
                  {endpoint.events.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{endpoint.events.length - 5} more
                    </Badge>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{endpoint.totalDeliveries ?? 0} deliveries</span>
                  {(endpoint.successfulDeliveries ?? 0) > 0 && (
                    <span className="text-green-600">{endpoint.successfulDeliveries} successful</span>
                  )}
                  {(endpoint.failedDeliveries ?? 0) > 0 && (
                    <span className="text-red-600">{endpoint.failedDeliveries} failed</span>
                  )}
                </div>
                {/* Test Result */}
                {testResult?.id === endpoint.id && (
                  <div
                    className={`mt-2 p-2 rounded text-xs ${
                      testResult.success
                        ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                        : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                    }`}
                  >
                    {testResult.message}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <WebhookFormDialog
        tenantSlug={tenantSlug}
        isOpen={formOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        eventTypes={eventTypes}
        editingEndpoint={editingEndpoint}
      />

      {/* History Dialog */}
      {historyEndpoint && (
        <WebhookDeliveryHistoryDialog
          tenantSlug={tenantSlug}
          endpointId={historyEndpoint.id}
          endpointName={historyEndpoint.name}
          isOpen={historyOpen}
          onClose={() => {
            setHistoryOpen(false);
            setHistoryEndpoint(null);
          }}
        />
      )}
    </div>
  );
}
