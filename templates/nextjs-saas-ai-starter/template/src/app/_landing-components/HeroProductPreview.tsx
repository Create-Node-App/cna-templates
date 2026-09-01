'use client';

import { Award, Brain, Search, Sparkles, Target, TrendingUp } from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';

/**
 * Hero Product Preview — Animated card stack that LIVES.
 *
 * Premium design with:
 *   - Sophisticated layered shadows & glass-morphism
 *   - Staggered entrance animations with smooth easing
 *   - Independent floating animations at different phases
 *   - Animated progress bars with delayed reveals
 *   - Floating insight badges with micro-interactions
 *   - Subtle ambient glow with color gradient
 *   - Responsive card sizing for mobile/desktop
 *   - Full accessibility with aria-hidden
 *
 * Design system alignment:
 *   - Domain accent borders (left 3px)
 *   - Premium elevation with multi-layer shadows
 *   - Strategic use of tenant colors
 *   - Smooth ease-out/ease-in-out curves
 */
export function HeroProductPreview() {
  return (
    <div className="relative w-full max-w-3xl mx-auto min-h-[550px] lg:min-h-[650px]" aria-hidden>
      {/* Dual-layer ambient glow with color gradient */}
      <div
        className="absolute inset-0 -inset-x-20 -inset-y-12 z-0 pointer-events-none opacity-60"
        style={{
          background: `
            radial-gradient(ellipse 80% 70% at 50% 40%,
              oklch(60% 0.14 290 / 0.12),
              oklch(55% 0.10 280 / 0.04),
              transparent)
          `,
          filter: 'blur(40px)',
          animation: 'glow-pulse 7s ease-in-out infinite',
        }}
      />
      <div
        className="absolute inset-0 -inset-x-32 -inset-y-16 z-0 pointer-events-none opacity-40"
        style={{
          background: `
            radial-gradient(ellipse 100% 80% at 60% 60%,
              oklch(58% 0.12 155 / 0.08),
              transparent)
          `,
          filter: 'blur(60px)',
          animation: 'glow-pulse 8s ease-in-out infinite 0.5s',
        }}
      />

      {/* ─── Floating badge: Growth metric (emerald) — TOP CENTER ─── */}
      <div
        className="absolute -top-10 left-1/2 -translate-x-1/2 z-30"
        style={{ animation: 'float-slow 5s 0.8s ease-in-out infinite' }}
      >
        <div
          className="flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold shadow-xl backdrop-blur-md border"
          style={{
            backgroundColor: 'hsl(var(--card) / 0.95)',
            color: 'oklch(58% 0.17 155)',
            borderColor: 'oklch(58% 0.17 155 / 0.2)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.15), 0 0 0 1px oklch(58% 0.17 155 / 0.1)',
            animation: 'hero-card-enter 0.6s 0.5s ease-out both',
          }}
        >
          <TrendingUp className="h-4 w-4" aria-hidden />
          <span>+42% faster onboarding</span>
        </div>
      </div>

      {/* ─── Card 1: Skill Profile — domain: skills (violet) ─── */}
      <div
        className={cn(
          'absolute top-4 left-2 w-60 lg:w-72 rounded-2xl backdrop-blur-sm',
          'transition-all duration-500 hover:shadow-2xl hover:-translate-y-1',
        )}
        style={
          {
            '--card-rotate': '-6deg',
            transform: 'rotate(-6deg)',
            backgroundColor: 'hsl(var(--card) / 0.9)',
            border: '1px solid hsl(var(--border) / 0.6)',
            borderLeft: '4px solid oklch(55% 0.18 290)',
            boxShadow:
              '0 12px 24px -6px rgba(0,0,0,0.12), 0 4px 8px -2px rgba(0,0,0,0.06), 0 0 0 1px hsl(var(--border) / 0.1)',
            animation:
              'hero-card-enter 0.8s 0.1s cubic-bezier(0.34, 1.56, 0.64, 1) both, float 6s 0.5s ease-in-out infinite',
          } as React.CSSProperties
        }
      >
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 font-bold text-white shadow-sm"
              style={{
                background: 'linear-gradient(135deg, oklch(55% 0.18 290), oklch(52% 0.14 290))',
              }}
            >
              JD
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Jane Doe</p>
              <p className="text-xs text-muted-foreground">Senior Developer</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {['React', 'TypeScript', 'Node.js'].map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium"
                style={{
                  backgroundColor: 'oklch(55% 0.18 290 / 0.12)',
                  color: 'oklch(45% 0.16 290)',
                }}
              >
                {skill}
              </span>
            ))}
          </div>
          <Badge
            variant="outline"
            className="text-xs bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/20"
          >
            + Leadership
          </Badge>
        </div>
      </div>

      {/* ─── Card 2: Platform Activity — domain: activity (emerald) ─── */}
      <div
        className={cn(
          'absolute top-4 right-2 w-56 lg:w-68 rounded-2xl backdrop-blur-sm',
          'transition-all duration-500 hover:shadow-2xl hover:-translate-y-1',
        )}
        style={
          {
            '--card-rotate': '6deg',
            transform: 'rotate(6deg)',
            backgroundColor: 'hsl(var(--card) / 0.9)',
            border: '1px solid hsl(var(--border) / 0.6)',
            borderLeft: '4px solid oklch(58% 0.17 155)',
            boxShadow:
              '0 12px 24px -6px rgba(0,0,0,0.12), 0 4px 8px -2px rgba(0,0,0,0.06), 0 0 0 1px hsl(var(--border) / 0.1)',
            animation:
              'hero-card-enter 0.8s 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both, float 7s 1s ease-in-out infinite',
          } as React.CSSProperties
        }
      >
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="h-7 w-7 rounded-md flex items-center justify-center"
              style={{ backgroundColor: 'oklch(58% 0.17 155 / 0.15)' }}
            >
              <Target className="h-4 w-4" style={{ color: 'oklch(58% 0.17 155)' }} />
            </div>
            <p className="text-sm font-semibold text-foreground">Platform Activity</p>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground font-medium">Team velocity</span>
                <span className="font-bold text-foreground">78%</span>
              </div>
              <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: '78%',
                    background: 'linear-gradient(90deg, oklch(58% 0.17 155), oklch(55% 0.14 155))',
                    animation: 'progress-fill 1.2s 0.8s ease-out both',
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground font-medium">Delivery</span>
                <span className="font-bold text-foreground">92%</span>
              </div>
              <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: '92%',
                    background: 'linear-gradient(90deg, oklch(52% 0.16 230), oklch(50% 0.13 230))',
                    animation: 'progress-fill 1.2s 1s ease-out both',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Card 3: People Finder — HERO card, primary domain ─── */}
      <div
        className={cn(
          'absolute top-[220px] left-1/2 -translate-x-1/2 w-[90%] lg:w-[85%] z-20 rounded-2xl backdrop-blur-md',
          'transition-all duration-500 hover:shadow-3xl hover:-translate-y-2',
        )}
        style={
          {
            '--card-rotate': '0deg',
            backgroundColor: 'hsl(var(--card) / 0.95)',
            border: '1px solid hsl(var(--primary) / 0.25)',
            borderLeft: '4px solid hsl(var(--primary))',
            boxShadow:
              '0 25px 50px -12px rgba(0,0,0,0.18), 0 10px 20px -8px rgba(0,0,0,0.1), 0 0 0 1px hsl(var(--primary) / 0.1)',
            animation:
              'hero-card-enter 0.9s 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both, float 8s 1.5s ease-in-out infinite',
          } as React.CSSProperties
        }
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="h-7 w-7 rounded-md flex items-center justify-center"
              style={{ backgroundColor: 'hsl(var(--primary) / 0.12)' }}
            >
              <Search className="h-4 w-4" style={{ color: 'hsl(var(--primary))' }} />
            </div>
            <span className="text-sm font-semibold text-foreground">People Finder</span>
            <Sparkles className="h-4 w-4 ml-auto text-amber-500 animate-pulse" aria-hidden />
          </div>
          <div className="space-y-2.5">
            {[
              {
                name: 'Ana García',
                role: 'Staff Engineer',
                match: 95,
                avatarColor: 'oklch(58% 0.17 155)',
                avatarBg: 'linear-gradient(135deg, oklch(58% 0.17 155), oklch(55% 0.14 155))',
              },
              {
                name: 'Marco Rivera',
                role: 'Tech Lead',
                match: 88,
                avatarColor: 'oklch(55% 0.18 290)',
                avatarBg: 'linear-gradient(135deg, oklch(55% 0.18 290), oklch(52% 0.14 290))',
              },
            ].map((person) => (
              <div
                key={person.name}
                className="flex items-center gap-3 rounded-xl p-3 transition-colors duration-300 hover:bg-muted/80"
                style={{ backgroundColor: 'hsl(var(--muted) / 0.4)' }}
              >
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 font-semibold text-white shadow-sm"
                  style={{
                    background: person.avatarBg,
                  }}
                >
                  {person.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{person.name}</p>
                  <p className="text-xs text-muted-foreground">{person.role}</p>
                </div>
                <span
                  className="text-xs font-bold shrink-0 px-2.5 py-1.5 rounded-lg"
                  style={{
                    backgroundColor: 'hsl(var(--primary) / 0.12)',
                    color: 'hsl(var(--primary))',
                  }}
                >
                  {person.match}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Floating badge: Recognitions (warm coral) ─── */}
      <div className="absolute bottom-20 -left-4 z-20" style={{ animation: 'float-slow 7s 2s ease-in-out infinite' }}>
        <div
          className="flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold shadow-lg backdrop-blur-sm"
          style={{
            backgroundColor: 'hsl(var(--card) / 0.9)',
            color: 'oklch(62% 0.19 45)',
            border: '1px solid oklch(62% 0.19 45 / 0.3)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px oklch(62% 0.19 45 / 0.1)',
            animation: 'hero-card-enter 0.5s 1.2s ease-out both',
          }}
        >
          <Award className="h-4 w-4" aria-hidden />
          <span>12 integrations</span>
        </div>
      </div>

      {/* ─── Floating badge: AI insight (violet) ─── */}
      <div
        className="absolute bottom-20 -right-4 z-20"
        style={{ animation: 'float-slow 6s 2.4s ease-in-out infinite' }}
      >
        <div
          className="flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold shadow-lg backdrop-blur-sm"
          style={{
            backgroundColor: 'hsl(var(--card) / 0.9)',
            color: 'oklch(55% 0.18 290)',
            border: '1px solid oklch(55% 0.18 290 / 0.3)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px oklch(55% 0.18 290 / 0.1)',
            animation: 'hero-card-enter 0.5s 1.5s ease-out both',
          }}
        >
          <Brain className="h-4 w-4" aria-hidden />
          <span>AI insights</span>
        </div>
      </div>
    </div>
  );
}
