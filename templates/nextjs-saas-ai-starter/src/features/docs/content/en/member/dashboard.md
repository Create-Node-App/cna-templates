---
title: Dashboard
description: Stats cards, quick actions, AI recommendations, activity feed, and growth suggestions for members.
section: member
order: 2
---

# Dashboard

Your Dashboard is your home base in Next.js SaaS AI Template. It surfaces key stats, quick actions, AI-driven recommendations, and recent activity so you can stay on top of skills, learning, and goals.

## Stats Cards

At the top of the Dashboard you’ll see summary cards, for example:

- **Skills assessed** — Number of skills you’ve self-assessed
- **Learning in progress** — Active assignments or roadmap items
- **OKRs** — Current quarter objectives and completion
- **Pending actions** — Items needing your attention (e.g. assessments, check-ins)

> **Tip:** Click a card to jump to the related section (e.g. Skills, Learning, OKRs).

Here is how a stat card looks:

```preview
component: StatCard
props: { "value": 42, "label": "Skills assessed" }
```

## Quick Actions

Quick actions let you start common tasks without leaving the Dashboard:

- Start or continue a **skills self-assessment**
- Open your next **learning** assignment or roadmap
- **Check in** on an OKR
- **Give feedback** or send recognition
- Open the **AI Assistant** for a question

Use these to keep momentum on growth and feedback without digging through menus.

## AI Recommendations

Next.js SaaS AI Template uses AI to suggest what to do next. Recommendations may include:

- **Skills to assess** — Skills you haven’t assessed or that are out of date
- **Learning to start** — Roadmaps or trainings that match your interests and level
- **OKRs to update** — Objectives that haven’t had a recent check-in
- **People to connect with** — Colleagues with skills or experience relevant to your goals

Recommendations are based on your profile, assessments, interests, and activity.

## Activity Feed

The activity feed shows recent events such as:

- New learning assignments or completions
- OKR check-ins or manager comments
- Feedback or recognition you received
- Skills verification or assessment updates

Scroll to see more. Use it to stay aware of changes and follow-ups.

## Growth Suggestions

The Dashboard may highlight **growth suggestions** — e.g. “Complete your React assessment” or “Start the Frontend roadmap.” These tie directly to your declared interests and current skill levels.

### Making the most of your Dashboard

1. **Review stats** — Glance at skills, learning, and OKRs to see where you stand.
2. **Use quick actions** — Do one small thing (e.g. one OKR check-in) regularly.
3. **Act on recommendations** — Prioritize one AI suggestion per week.
4. **Check the feed** — Skim new assignments, feedback, and recognition.

> **Tip:** Visit your Dashboard at the start of the week to plan focus areas and at the end to close loops (check-ins, completions).
