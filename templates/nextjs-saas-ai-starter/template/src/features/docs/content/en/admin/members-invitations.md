---
title: Members & Invitations
description: Add and remove members, generate invite links with roles, manage member status, and invite expiration.
section: admin
order: 2
---

# Members & Invitations

Admins manage **who is in the tenant** and **how they get in**. You can add members directly, send invitations with a chosen role, and control invite expiration and member status.

## Adding Members

You can add members in two main ways:

1. **Invitation** — Send an invite link or email; the person accepts and is added with the role you chose.
2. **Direct add / import** — Create the membership yourself (e.g. after bulk import or SSO). The person may still need to complete profile setup.

### Sending an Invitation

1. Go to **Admin** → **Members** (or **Invitations**).
2. Click **Invite member** (or **Create invitation**).
3. **Enter email** (and optionally name).
4. **Choose a role** — Select the role(s) the person will have when they accept (e.g. Member, Manager, 1:1er). This sets their initial permissions.
5. **Set expiration** (if your tenant supports it) — e.g. 7 or 30 days. After that, the link may no longer work and you may need to resend.
6. Generate the link or send the email. Share the invite link with the person (or they receive it by email if that's configured).

> **Tip:** Use roles that match the person's job: e.g. "Member" for most people, "Manager" or "1:1er" only when they need those permissions.

## Invite Links and Roles

- **Invite link** — A unique URL that, when opened (and logged in or after sign-up), creates or updates the person's membership in the tenant with the **role(s)** you selected.
- **Roles** — Come from your tenant's roles (system roles like Member, Manager, Admin, 1:1er, Referente, plus any custom roles). The invite stores the chosen **role ID**; on accept, that role is assigned in `tenant_membership_roles`.

A person can have **multiple roles** after they're in; you can change roles later from the Members list.

## Managing Member Status

From the **Members** list you can:

- **View** all tenant members, their roles, and status (active, inactive, etc. if your tenant supports it).
- **Edit roles** — Add or remove roles for a member (multiselect from tenant roles). Effective permissions are the union of all their roles.
- **Deactivate or remove** — Depending on tenant config, you may be able to deactivate a member (they lose access) or remove them from the tenant.

Changes to roles take effect on the next request; the member may need to refresh or log in again to see updated menus and permissions.

## Invite Expiration

If **invite expiration** is enabled:

- Each invite has a **valid until** date. After that date, the link may show an error or ask for a new invite.
- You can **resend** or **regenerate** an invite from the Invitations list if it expired.
- Shorter expiration (e.g. 7 days) improves security; longer (e.g. 30 days) is more convenient for onboarding.

## Step-by-Step: Invite a New Team Member

1. Go to **Admin** → **Members** → **Invitations** (or **Invite member**).
2. Enter the person's **email** and select **role(s)** (e.g. Member).
3. Set **expiration** if required.
4. Click **Send** or **Generate link**. Copy the link if you need to share it manually.
5. The person opens the link, signs in (or signs up), and accepts. They are now a member with the chosen role(s).
6. Optionally go to **Members**, find them, and add more roles (e.g. 1:1er) or adjust as needed.

> **Tip:** Keep an eye on the Invitations list for pending or expired invites and resend or extend as needed so new joiners aren't blocked.
