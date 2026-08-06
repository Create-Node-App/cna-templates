/**
 * Admin Feature
 *
 * Centralized administration for tenant management:
 * - Team members management
 * - Tenant settings configuration
 * - Integrations management
 * - Webhooks management
 * - Audit logs
 */

// Shared Components
export * from './components/AdminDataTable';
export * from './components/AdminFormDialog';
export * from './components/AdminPageHeader';

// Page Clients
export { MembersClient } from './components/MembersClient';
export { InvitesClient } from './components/InvitesClient';
export { SettingsClient } from './components/SettingsClient';
export { AuditLogsClient } from './components/AuditLogsClient';
export { RolesClient } from './components/RolesClient';
export { DepartmentsClient } from './components/DepartmentsClient';
export { IntegrationsClient } from './components/IntegrationsClient';
export { IntegrationFeatureFlags } from './components/IntegrationFeatureFlags';
export { IntegrationControlPlanePanel } from './components/IntegrationControlPlanePanel';
export { WebhooksClient } from './components/WebhooksClient';
export { WebhookFormDialog } from './components/WebhookFormDialog';
export { WebhookDeliveryHistoryDialog } from './components/WebhookDeliveryHistoryDialog';
export { WebhooksSettingsPanel } from './components/WebhooksSettingsPanel';

// Types
export * from './types';
