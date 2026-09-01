import { BookOpen, Building2, Crown, Shield, Sparkles, TrendingUp, User, Users } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { FeatureTabShowcase } from '@/app/_landing-components/FeatureTabShowcase';
import { HeroProductPreview } from '@/app/_landing-components/HeroProductPreview';
import { HowItWorks } from '@/app/_landing-components/HowItWorks';
import { LandingFooter } from '@/app/_landing-components/LandingFooter';
import { LandingNavbar } from '@/app/_landing-components/LandingNavbar';
import { PricingFAQ } from '@/app/_landing-components/PricingFAQ';
import { SocialProof } from '@/app/_landing-components/SocialProof';
import { DevUsersPanel } from '@/app/DevUsersPanel';
import { LANDING_PRICING_PLANS } from '@/app/landing-data';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui';
import { RevealOnScroll } from '@/shared/components/ui/reveal-on-scroll';
import type { TenantRole } from '@/shared/db/schema/auth';
import { auth } from '@/shared/lib/auth';

export default async function Home() {
  const session = await auth();
  const t = await getTranslations('landing');
  const user = session?.user;

  // Get user's tenant memberships
  const userRoles = user?.roles as Record<string, TenantRole> | undefined;
  const tenantSlugs = userRoles ? Object.keys(userRoles) : [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <LandingNavbar
        user={
          user
            ? {
                name: user.name ?? undefined,
                email: user.email ?? undefined,
                image: user.image ?? undefined,
              }
            : undefined
        }
        tenantSlugs={tenantSlugs}
      />

      {/* Hero Section — Editorial two-column layout.
           Clean, intentional. The ONLY gradient is the brand-gradient-text on "Skill".
           No decorative blur blobs. See DESIGN_SYSTEM.md Section 8.4: "The Brand Moment" */}
      <section
        className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/30"
        aria-labelledby="hero-heading"
      >
        <div className="container mx-auto px-4 py-16 lg:py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column — Text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                <Sparkles className="h-4 w-4" aria-hidden />
                {t('hero.badge')}
              </div>
              <h1 id="hero-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                <span className="brand-gradient-text">{t('hero.title.one')}</span>
                <span className="text-foreground">{t('hero.title.two')}</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
                {t('hero.description')}
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8">
                {user ? (
                  <Link href={tenantSlugs.length === 1 ? `/t/${tenantSlugs[0]}` : '/select-tenant'}>
                    <Button size="lg" className="gap-2 rounded-xl" aria-label={t('hero.cta.goToDashboard')}>
                      <TrendingUp className="h-4 w-4" aria-hidden />
                      {t('hero.cta.goToDashboard')}
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login">
                      <Button size="lg" className="gap-2 rounded-xl" aria-label={t('hero.cta.getStarted')}>
                        <Sparkles className="h-4 w-4" aria-hidden />
                        {t('hero.cta.getStarted')}
                      </Button>
                    </Link>
                    <Link href="/docs">
                      <Button
                        variant="outline"
                        size="lg"
                        className="gap-2 rounded-xl"
                        aria-label={t('hero.cta.explore')}
                      >
                        <BookOpen className="h-4 w-4" aria-hidden />
                        {t('hero.cta.explore')}
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Social proof strip */}
              <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" aria-hidden />
                  <span>{t('hero.socialProof.enterpriseReady')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" aria-hidden />
                  <span>{t('hero.socialProof.aiNative')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" aria-hidden />
                  <span>{t('hero.socialProof.growthFocused')}</span>
                </div>
              </div>
            </div>

            {/* Right Column — Animated Product Preview */}
            <div className="relative h-[400px] lg:h-[480px]">
              <HeroProductPreview />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-muted/30 scroll-mt-14" aria-labelledby="how-heading">
        <RevealOnScroll>
          <div className="container mx-auto">
            <h2 id="how-heading" className="text-3xl font-bold text-center mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Get your team up and running in three simple steps.
            </p>
            <HowItWorks />
          </div>
        </RevealOnScroll>
      </section>

      {/* Features Section — Tabbed Showcase */}
      <section id="features" className="py-20 px-4 bg-background scroll-mt-14" aria-labelledby="features-heading">
        <RevealOnScroll>
          <div className="container mx-auto">
            <h2 id="features-heading" className="text-3xl font-bold text-center mb-4">
              {t('features.title')}
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">{t('features.description')}</p>
            <FeatureTabShowcase />
          </div>
        </RevealOnScroll>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4 bg-muted/30" aria-labelledby="trust-heading">
        <RevealOnScroll>
          <div className="container mx-auto">
            <h2 id="trust-heading" className="sr-only">
              {t('hero.socialProof.enterpriseReady')}
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
              <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-card shadow-sm border border-border/60">
                <Shield className="h-8 w-8 text-primary shrink-0" />
                <div>
                  <p className="font-semibold">{t('hero.socialProof.enterpriseReady')}</p>
                  <p className="text-sm text-muted-foreground">{t('hero.socialProof.enterpriseDesc')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-card shadow-sm border border-border/60">
                <Sparkles className="h-8 w-8 text-amber-500 shrink-0" />
                <div>
                  <p className="font-semibold">{t('hero.socialProof.aiNative')}</p>
                  <p className="text-sm text-muted-foreground">{t('hero.socialProof.aiNativeDesc')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-card shadow-sm border border-border/60">
                <TrendingUp className="h-8 w-8 text-green-500 shrink-0" />
                <div>
                  <p className="font-semibold">{t('hero.socialProof.growthFocused')}</p>
                  <p className="text-sm text-muted-foreground">{t('hero.socialProof.growthDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* Social Proof: Testimonials & Sponsors */}
      <section className="py-20 px-4 bg-muted/20" aria-labelledby="social-proof-heading">
        <RevealOnScroll>
          <div className="container mx-auto" id="social-proof-heading">
            <SocialProof />
          </div>
        </RevealOnScroll>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-24 px-4 bg-gradient-to-b from-background via-muted/20 to-background scroll-mt-14"
        aria-labelledby="pricing-heading"
      >
        <RevealOnScroll>
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                <Crown className="h-4 w-4" aria-hidden />
                {t('pricing.badge')}
              </div>
              <h2
                id="pricing-heading"
                className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
              >
                {t('pricing.title')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('pricing.description')}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-20">
              {LANDING_PRICING_PLANS.map((plan, index) => {
                const planIcons = [User, Users, Crown, Building2];
                const PlanIcon = planIcons[index] || User;
                const planColors = [
                  {
                    border: 'border-l-violet-500',
                    bg: 'bg-violet-500/10 dark:bg-violet-500/20',
                    icon: 'text-violet-500',
                  },
                  {
                    border: 'border-l-emerald-500',
                    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
                    icon: 'text-emerald-500',
                  },
                  { border: 'border-l-rose-500', bg: 'bg-rose-500/10 dark:bg-rose-500/20', icon: 'text-rose-500' },
                  {
                    border: 'border-l-indigo-500',
                    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
                    icon: 'text-indigo-500',
                  },
                ];
                const colors = planColors[index] || planColors[0];

                return (
                  <Card
                    key={plan.name}
                    className={`relative flex flex-col h-full rounded-2xl border-l-4 ${colors.border} transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-xl group ${
                      plan.highlighted
                        ? 'shadow-xl border-t border-r border-b border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10'
                        : 'shadow-md hover:shadow-lg border-t border-r border-b border-border/40 bg-card/50 backdrop-blur-sm'
                    }`}
                  >
                    {plan.highlighted && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary/90 px-4 py-2 text-xs font-bold text-primary-foreground shadow-xl">
                          <Sparkles className="h-3 w-3" />
                          {t('pricing.mostPopular')}
                        </div>
                      </div>
                    )}
                    <CardHeader className={`pb-4 pt-6 ${colors.bg} rounded-t-2xl border-b border-border/20`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-xl ${colors.icon} bg-background/80 border border-border/20`}>
                          <PlanIcon className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-xl font-semibold">{plan.name}</CardTitle>
                      </div>
                      <CardDescription className="text-base leading-relaxed">{plan.description}</CardDescription>
                      <div className="flex items-baseline gap-2 mt-3">
                        <p className="text-3xl font-bold text-foreground">{plan.price}</p>
                        {plan.price !== '$0' && (
                          <span className="text-sm text-muted-foreground font-medium">{t('pricing.perMonth')}</span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col pt-6 px-6 pb-6">
                      <ul className="space-y-3 text-sm mb-8 flex-1">
                        {plan.features.map((f) => (
                          <li key={f} className="flex gap-3 items-start">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                              <span className="text-primary text-xs font-bold" aria-hidden>
                                ✓
                              </span>
                            </div>
                            <span className="text-muted-foreground leading-relaxed">{f}</span>
                          </li>
                        ))}
                      </ul>
                      {user ? (
                        <Link
                          href={tenantSlugs.length === 1 ? `/t/${tenantSlugs[0]}` : '/select-tenant'}
                          className="mt-auto"
                        >
                          <Button
                            className={`w-full rounded-xl h-11 font-semibold transition-all duration-200 ${
                              plan.highlighted
                                ? 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl'
                                : 'hover:scale-[1.02]'
                            }`}
                            aria-label={`Go to dashboard for ${plan.name}`}
                          >
                            {plan.cta}
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/login" className="mt-auto">
                          <Button
                            className={`w-full rounded-xl h-11 font-semibold transition-all duration-200 ${
                              plan.highlighted
                                ? 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl'
                                : 'hover:scale-[1.02]'
                            }`}
                            variant={plan.highlighted ? 'default' : 'outline'}
                            aria-label={`${plan.cta} for ${plan.name}`}
                          >
                            {plan.cta}
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* FAQ */}
            <h3 className="text-2xl font-bold text-center mb-8">{t('faq.title')}</h3>
            <PricingFAQ />
          </div>
        </RevealOnScroll>
      </section>

      {/* Footer */}
      <LandingFooter />

      {/* Development Mode - Test Users Panel */}
      {(process.env.NEXT_PUBLIC_STAGE === 'dev' || process.env.NODE_ENV === 'development') && <DevUsersPanel />}
    </div>
  );
}
