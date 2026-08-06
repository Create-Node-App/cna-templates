---
title: Navigation & Views
description: Learn the four main views (My View, Manager, 1:1, Admin), sidebar navigation, global search, theme, and locale options.
section: getting-started
order: 3
---

# Navigation & Views

Next.js SaaS AI Template organizes the product into **views** and a **sidebar**. This page explains how to move around the app, use global search, and adjust theme and language.

---

## Four Main Views

What you see in the app depends on your **role and permissions**. The four views are:

| View             | Who sees it                                            | Purpose                                                                                                                                             |
| ---------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **My View**      | Everyone                                               | Your own profile, skills, OKRs, learning, performance, projects, People Finder, Knowledge Base, feedback, and AI assistant.                         |
| **Manager View** | Users with manager (or higher) permissions             | Team dashboard, reports, projects & clients, performance assessments, learning assignments, team OKRs, and 1:1 meeting tools.                       |
| **1:1 View**     | Users who are 1:1 facilitators for at least one person | List of people you run 1:1s with, their meetings, and read-only access to their performance and projects.                                           |
| **Admin View**   | Users with admin permissions                           | Tenant configuration: members & invitations, skills, capabilities, role profiles, roadmaps, roles & permissions, settings, integrations, analytics. |

You only see views you have access to. For example, if you are only a Member, you see **My View**. If you are a Manager and a 1:1 Facilitator, you see **My View**, **Manager View**, and **1:1 View**.

### Switching views

- Use the **sidebar**: the top-level sections often map to these views (e.g. “My”, “Manager”, “1:1”, “Admin”).
- Or use a **view switcher** in the header or sidebar that lets you choose the active view. The sidebar menu then shows items for that view.

---

## Sidebar Navigation

The **sidebar** is the main way to move between sections.

- **Collapsible** — You can collapse the sidebar to icons only to get more space; expand it again to see full labels.
- **View-specific** — When you switch views (My / Manager / 1:1 / Admin), the sidebar updates to show only the pages relevant to that view. For example:
  - In **My View**: Dashboard, Profile, Skills, OKRs, Learning, Performance, Projects, People Finder, Knowledge Base, Feedback & recognition, AI Assistant, etc.
  - In **Manager View**: Manager dashboard, Team, Projects & clients, Performance assessments, Learning assignments, Team OKRs, 1:1 meetings, Analytics.
  - In **1:1 View**: 1:1 dashboard, Meetings, Performance & projects (read-only for 1:1 people).
  - In **Admin View**: Members & invitations, Skills, Capabilities, Role profiles, Roadmaps, Roles & permissions, Settings, Integrations, Analytics, etc.

Click a sidebar item to go to that page. The current page is usually highlighted.

> **Tip:** If you don’t see a section you expect, you may not have permission for it, or it may live under a different view. Switch views and check the sidebar again.

---

## Global Search (Cmd+K / Ctrl+K)

Next.js SaaS AI Template provides **global search** so you can jump to people, docs, or actions without clicking through menus.

1. Press **Cmd+K** (Mac) or **Ctrl+K** (Windows/Linux), or use the search trigger in the header.
2. Type your query (e.g. a person’s name, a doc title, or an action like “Create OKR”).
3. Use the keyboard or mouse to pick a result. You’ll be taken to the corresponding page or action.

Global search is especially useful once you know the app a bit; use it to open profiles, docs, or frequent tasks quickly.

---

## Theme Toggle (Light / Dark)

If your tenant allows it, you can switch between **light** and **dark** theme.

- Look for a **theme toggle** in the header, sidebar footer, or in your profile/settings (e.g. sun/moon icon).
- Your choice is usually saved so the next time you log in you see the same theme.

Where the toggle lives can vary by layout; check the top bar or the **Profile / Settings** area if you don’t see it.

---

## Locale Switcher (English / Spanish)

Next.js SaaS AI Template can be used in multiple languages (e.g. **English** and **Spanish**).

- Use the **locale switcher** in the header or account menu (often a globe or “EN” / “ES” control).
- Select your preferred language. The UI and, where available, documentation will switch to that locale.
- The setting is typically remembered for your next visit.

> **Tip:** Documentation may be available in the same locales; if you switch language, check whether the docs URL or sidebar updates to the matching language (e.g. `/docs/en/` vs `/docs/es/`).

---

## Putting It Together

1. **Choose your view** (My / Manager / 1:1 / Admin) from the sidebar or view switcher.
2. **Use the sidebar** to open the section you need; collapse it when you want more screen space.
3. **Use Cmd+K (or Ctrl+K)** to search and jump to people, docs, or actions.
4. **Set theme and language** via the header or settings so the app fits your preferences.

For the next step, complete [Profile Setup](/docs/en/getting-started/profile-setup) so your identity and preferences are set correctly across the platform.
