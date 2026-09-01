import Link from 'next/link';

import { AppLogo } from '@/shared/components/brand/Logo';

export function LandingFooter() {
  return (
    <footer className="border-t bg-card/50 py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <AppLogo href="/" size="sm" className="mb-3" />
            <p className="text-sm text-muted-foreground max-w-xs">
              Production-ready Next.js SaaS boilerplate with multi-tenancy, AI, and integrations.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground/60 cursor-default">Blog (coming soon)</span>
              </li>
              <li>
                <span className="text-muted-foreground/60 cursor-default">Changelog (coming soon)</span>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-muted-foreground/60 cursor-default">About (coming soon)</span>
              </li>
              <li>
                <span className="text-muted-foreground/60 cursor-default">Contact (coming soon)</span>
              </li>
              <li>
                <span className="text-muted-foreground/60 cursor-default">Privacy (coming soon)</span>
              </li>
              <li>
                <span className="text-muted-foreground/60 cursor-default">Terms (coming soon)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border/60">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Next.js SaaS AI Template. Built with Next.js, Tailwind CSS, and Drizzle ORM.
          </p>
          <div className="flex items-center gap-4">
            {/* Social placeholders */}
            {['GitHub', 'LinkedIn', 'Twitter'].map((name) => (
              <span
                key={name}
                className="text-xs text-muted-foreground/60 cursor-default"
                title={`${name} (coming soon)`}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
