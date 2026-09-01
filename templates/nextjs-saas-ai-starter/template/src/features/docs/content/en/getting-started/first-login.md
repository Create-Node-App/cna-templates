---
title: First Login
description: How to sign in to Next.js SaaS AI Template with Auth0 (SSO or email), choose a tenant, and get oriented on your first visit.
section: getting-started
order: 2
---

# First Login

This guide walks you through signing in to Next.js SaaS AI Template for the first time, selecting your organization (tenant), and making the most of your first dashboard experience.

---

## Signing In with Auth0

Next.js SaaS AI Template uses **Auth0** for authentication. You can sign in with:

- **Single sign-on (SSO)** — If your organization uses SSO (e.g. Google Workspace, Microsoft Azure AD), use the option provided by your admin. You may be redirected to your company’s login page.
- **Email and password** — If your tenant allows it, you can register or sign in with email.
- **Social or enterprise connections** — Depending on tenant configuration, options such as Google, GitHub, or LinkedIn may be available.

### Steps to log in

1. Open the Next.js SaaS AI Template URL provided by your organization (e.g. `https://your-tenant.saas-template.app` or your company’s custom domain).
2. Click **Sign in** (or **Log in**).
3. Choose the sign-in method offered (SSO, email, or social).
4. Complete the Auth0 flow (enter credentials, approve MFA if required).
5. After authentication, you are redirected back to Next.js SaaS AI Template.

> **Tip:** If you don’t see the sign-in option you expect, your tenant may only have SSO or specific connections enabled. Contact your Next.js SaaS AI Template admin or IT for the correct login method.

---

## Tenant Selection (Multiple Organizations)

If you belong to **more than one organization** (tenant) in Next.js SaaS AI Template, you must choose which one to use after login.

- You may see a **tenant switcher** or a **tenant selection screen** listing your organizations.
- Select the tenant you want to work in. The app will load that tenant’s data: members, skills, projects, and settings.
- You can switch tenants later from the app header or account menu without logging out.

If you only have one tenant, this step may be skipped and you go straight to the dashboard.

---

## First-Time Dashboard Experience

After signing in and selecting a tenant (if applicable), you land on your **dashboard**. What you see depends on your role:

- **Members** see **My View**: a personal dashboard with quick links to profile, skills, OKRs, learning, performance, and more.
- **Managers** may also see **Manager View**: team overview, reports, and manager-specific actions.
- **1:1 Facilitators** can open **1:1 View**: the list of people they have 1:1s with and related meetings.
- **Admins** can access **Admin View**: configuration, members, skills, and tenant settings.

On first login you might see:

- Empty or placeholder sections until you complete profile setup and start using features.
- Onboarding hints or tooltips (if your tenant has enabled them).
- Notifications or tasks (e.g. “Complete your profile”, “Set your first OKR”).

> **Tip:** Spend a few minutes on [Profile Setup](/docs/en/getting-started/profile-setup) so your name, title, and preferences are correct. Then explore [Navigation & Views](/docs/en/getting-started/navigation) to learn where everything lives.

---

## Tips for Getting Started

1. **Complete your profile** — Add name, title, bio, timezone, and (optionally) GitHub/LinkedIn. This helps colleagues find you in People Finder and improves AI suggestions.
2. **Pick your view** — Use the sidebar or view switcher to move between My View, Manager View, 1:1 View, and Admin View (if you have access). Each view has its own menu.
3. **Use global search** — Press **Cmd+K** (Mac) or **Ctrl+K** (Windows/Linux) to search across people, docs, and actions.
4. **Set language and theme** — Use the locale switcher for English/Spanish and the theme toggle for light/dark mode if your tenant supports them.
5. **Bookmark the docs** — Keep the [Welcome to Next.js SaaS AI Template](/docs/en/getting-started) and role-specific guides handy for reference as you explore.

If you run into login issues (wrong tenant, missing SSO, locked account), contact your **Next.js SaaS AI Template administrator** or your organization’s IT support.

---

## Security and Sessions

- **Session duration** — How long you stay signed in depends on your tenant’s Auth0 and Next.js SaaS AI Template settings. You may be asked to sign in again after a period of inactivity or after a set time.
- **Signing out** — Use the account menu (your avatar or name in the header) and choose **Sign out** (or **Log out**). You will need to sign in again to access Next.js SaaS AI Template.
- **Multiple devices** — You can use Next.js SaaS AI Template on more than one device. Each session follows the same security and timeout rules. Sign out on shared devices when you are done.
- **Password and MFA** — Password changes and multi-factor authentication are managed in Auth0 (or your SSO provider). If you need to reset your password or update MFA, use the link from the login page or contact your IT or Next.js SaaS AI Template admin.
