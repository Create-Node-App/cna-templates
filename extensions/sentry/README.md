# Sentry Extension

Adds [Sentry](https://sentry.io/) error monitoring and performance tracking to your Next.js project.

## Generated files

- `sentry.client.config.ts` — client-side Sentry configuration
- `sentry.server.config.ts` — server-side Sentry configuration
- `.sentryclirc` — Sentry CLI config (DSN, org, project)
- `src/app/global-error.tsx` — global error boundary for App Router

## Usage

Set the required environment variables:

- `SENTRY_DSN` — your project DSN from Sentry
- `SENTRY_ORG` — your Sentry organization slug (optional for source maps)
- `SENTRY_PROJECT` — your Sentry project slug (optional for source maps)

Errors are automatically captured. Review performance traces in your Sentry dashboard.

## Resources

- [Sentry Next.js SDK](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Dashboard](https://sentry.io/)
