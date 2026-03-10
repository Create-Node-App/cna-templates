/**
 * Shared Providers
 *
 * React context providers for application-wide state.
 */

export {
  TenantProvider,
  TenantContext,
  useTenant,
  useTenantOptional,
  type TenantContextValue,
} from './tenant-provider';

export {
  SidebarProvider,
  SidebarContext,
  useSidebar,
  useSidebarOptional,
  type SidebarContextValue,
} from './sidebar-provider';

export {
  ViewProvider,
  ViewContext,
  useView,
  useViewOptional,
  type ViewContextValue,
  type ViewType,
} from './view-provider';
