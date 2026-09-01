/**
 * Tests for FeatureGate component
 */

import { render, screen } from '@testing-library/react';
import React from 'react';

import { applySettingsDefaults } from '@/shared/lib/tenant-settings';
import { TenantContext, type TenantContextValue } from '@/shared/providers/tenant-provider';

import { FeatureGate } from '../use-feature-gate';

// Helper to create a wrapper with TenantContext
const createWrapper = (value: TenantContextValue) => {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
  };
};

describe('FeatureGate', () => {
  it('should render children when feature is enabled', () => {
    const settings = applySettingsDefaults({ features: { knowledgeBase: true } });
    const Wrapper = createWrapper({
      id: 'tenant-123',
      slug: 'test',
      name: 'Test',
      settings,
    });

    render(
      <Wrapper>
        <FeatureGate feature="knowledgeBase">
          <div data-testid="content">Feature Content</div>
        </FeatureGate>
      </Wrapper>,
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should not render children when feature is disabled', () => {
    const settings = applySettingsDefaults({ features: { webhooks: false } });
    const Wrapper = createWrapper({
      id: 'tenant-123',
      slug: 'test',
      name: 'Test',
      settings,
    });

    render(
      <Wrapper>
        <FeatureGate feature="webhooks">
          <div data-testid="content">Feature Content</div>
        </FeatureGate>
      </Wrapper>,
    );

    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('should render fallback when feature is disabled', () => {
    const settings = applySettingsDefaults({ features: { webhooks: false } });
    const Wrapper = createWrapper({
      id: 'tenant-123',
      slug: 'test',
      name: 'Test',
      settings,
    });

    render(
      <Wrapper>
        <FeatureGate feature="webhooks" fallback={<div data-testid="fallback">Fallback Content</div>}>
          <div data-testid="content">Feature Content</div>
        </FeatureGate>
      </Wrapper>,
    );

    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
  });

  it('should render nothing as default fallback', () => {
    const settings = applySettingsDefaults({ features: { githubIntegrationEnabled: false } });
    const Wrapper = createWrapper({
      id: 'tenant-123',
      slug: 'test',
      name: 'Test',
      settings,
    });

    const { container } = render(
      <Wrapper>
        <FeatureGate feature="githubIntegrationEnabled">
          <div data-testid="content">Feature Content</div>
        </FeatureGate>
      </Wrapper>,
    );

    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    expect(container.innerHTML).toBe('');
  });

  it('should handle multiple children', () => {
    const settings = applySettingsDefaults({ features: { aiAssistantEnabled: true } });
    const Wrapper = createWrapper({
      id: 'tenant-123',
      slug: 'test',
      name: 'Test',
      settings,
    });

    render(
      <Wrapper>
        <FeatureGate feature="aiAssistantEnabled">
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </FeatureGate>
      </Wrapper>,
    );

    expect(screen.getByTestId('child1')).toBeInTheDocument();
    expect(screen.getByTestId('child2')).toBeInTheDocument();
  });
});
