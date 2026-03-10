'use client';

import { ChevronDown, ChevronUp, Code2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const DEV_USERS = [
  {
    label: 'Admin – Full Access',
    email: 'admin@example.com',
    role: 'Admin',
    description: 'Full admin access, all features enabled.',
  },
  {
    label: 'Member – Sample User',
    email: 'member@example.com',
    role: 'Member',
    description: 'Regular member with sample data.',
  },
  {
    label: 'Member – Fresh Start',
    email: 'member_new@example.com',
    role: 'Member',
    description: 'New user, no data, good for testing onboarding.',
  },
];

function roleBadgeClass(role: string): string {
  switch (role) {
    case 'Admin':
      return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
    default:
      return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
  }
}

export function DevUsersPanel() {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/30 rounded-lg shadow-lg backdrop-blur-sm hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
        aria-label="Abrir panel de usuarios de desarrollo"
      >
        <Code2 className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Dev users</span>
        <ChevronUp className="h-4 w-4 text-amber-600 dark:text-amber-400 rotate-180 shrink-0" aria-hidden />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 p-4 bg-amber-50 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/30 rounded-lg shadow-lg max-w-xs backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm">Development Mode</p>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="p-1 rounded hover:bg-amber-200 dark:hover:bg-amber-800/50 text-amber-700 dark:text-amber-300 transition-colors"
          aria-label="Minimizar panel de usuarios de desarrollo"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
        Test users for tenant <code className="bg-amber-200 dark:bg-amber-900 px-1 rounded">demo</code>:
      </p>
      <ul className="space-y-2">
        {DEV_USERS.map((devUser) => (
          <li key={devUser.email} className="text-xs">
            <Link
              href={`/login?email=${encodeURIComponent(devUser.email)}`}
              className="block rounded-md p-2 -mx-2 transition-colors hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-transparent hover:border-amber-300 dark:hover:border-amber-700"
              aria-label={`Sign in as ${devUser.label} (${devUser.email})`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${roleBadgeClass(devUser.role)}`}
                >
                  {devUser.role}
                </span>
                <span className="font-medium text-amber-900 dark:text-amber-100 truncate">{devUser.label}</span>
              </div>
              <p className="text-amber-600 dark:text-amber-400 mt-0.5 ml-[52px]">{devUser.description}</p>
              <code className="text-[10px] text-amber-700 dark:text-amber-300 mt-0.5 ml-[52px] block font-mono truncate">
                {devUser.email}
              </code>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
