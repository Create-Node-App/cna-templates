/**
 * Brand icon components for all integrations.
 * Each renders an SVG mark suitable for 16-48px display.
 */

interface IconProps {
  className?: string;
}

/** Google Workspace - Google "G" multi-color logo */
export function GoogleWorkspaceIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 6c2.654 0 5.064 1.022 6.874 2.694l-2.81 2.81A6.42 6.42 0 0016 9.84c-3.518 0-6.4 2.882-6.4 6.4 0 3.518 2.882 6.4 6.4 6.4 2.96 0 5.32-1.508 6.06-3.84H16v-3.6h10.24c.16.84.24 1.7.24 2.56C26.48 23.876 21.876 28 16 28 9.373 28 4 22.627 4 16S9.373 4 16 4v2z"
        fill="#4285F4"
      />
      <path
        d="M4 16c0-2.654 1.022-5.064 2.694-6.874L9.504 11.936A6.38 6.38 0 009.6 16.24l-2.906 2.634A11.94 11.94 0 014 16z"
        fill="#34A853"
      />
      <path d="M16 28c-3.276 0-6.22-1.316-8.374-3.448l2.81-2.81A6.4 6.4 0 0016 24.24V28z" fill="#FBBC05" />
      <path
        d="M28 16c0-.86-.08-1.72-.24-2.56H16v3.6h6.06a6.38 6.38 0 01-2.624 3.218l2.81 2.81C24.656 21.236 28 18.88 28 16z"
        fill="#EA4335"
      />
    </svg>
  );
}

/** Slack - Hash/pound logo in 4 colors */
export function SlackIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#4A154B" />
      <path d="M10.5 18.5a1.5 1.5 0 110-3h3v3a1.5 1.5 0 01-1.5 1.5 1.5 1.5 0 01-1.5-1.5z" fill="#E01E5A" />
      <path d="M12 18.5v-6a1.5 1.5 0 113 0v6a1.5 1.5 0 11-3 0z" fill="#E01E5A" />
      <path d="M13.5 10.5a1.5 1.5 0 110 3h-3v-3a1.5 1.5 0 011.5-1.5 1.5 1.5 0 011.5 1.5z" fill="#36C5F0" />
      <path d="M13.5 12h6a1.5 1.5 0 110 3h-6a1.5 1.5 0 110-3z" fill="#36C5F0" />
      <path d="M21.5 13.5a1.5 1.5 0 11-3 0v-3h3a1.5 1.5 0 010 3z" fill="#2EB67D" />
      <path d="M20 13.5v6a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 113 0z" fill="#2EB67D" />
      <path d="M18.5 21.5a1.5 1.5 0 110-3h3v3a1.5 1.5 0 01-3 0z" fill="#ECB22E" />
      <path d="M18.5 20h-6a1.5 1.5 0 110-3h6a1.5 1.5 0 110 3z" fill="#ECB22E" />
    </svg>
  );
}

/** GitHub - Octocat mark */
export function GitHubIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#24292E" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 6C10.477 6 6 10.477 6 16c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.607.069-.607 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0116 11.11c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C23.138 24.163 26 20.418 26 16c0-5.523-4.477-10-10-10z"
        fill="white"
      />
    </svg>
  );
}

/** GitLab - Fox/tanuki logo */
export function GitLabIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#FC6D26" />
      <path d="M16 25l3.5-10.8H12.5L16 25z" fill="#E24329" />
      <path d="M16 25l-3.5-10.8H7.1L16 25z" fill="#FC6D26" />
      <path d="M7.1 14.2l-1.6 4.9c-.15.45 0 .94.38 1.22L16 25 7.1 14.2z" fill="#FCA326" />
      <path d="M7.1 14.2h5.4L10.2 7.4c-.12-.36-.63-.36-.75 0L7.1 14.2z" fill="#E24329" />
      <path d="M16 25l3.5-10.8h5.4L16 25z" fill="#FC6D26" />
      <path d="M24.9 14.2l1.6 4.9c.15.45 0 .94-.38 1.22L16 25l8.9-10.8z" fill="#FCA326" />
      <path d="M24.9 14.2h-5.4l2.3-6.8c.12-.36.63-.36.75 0l2.35 6.8z" fill="#E24329" />
    </svg>
  );
}

/** LinkedIn - "in" logo */
export function LinkedInIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#0A66C2" />
      <path
        d="M10.5 13.5v8h-2.5v-8h2.5zM9.25 12.25a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM24 21.5h-2.5v-3.9c0-.93-.017-2.13-1.3-2.13-1.3 0-1.5 1.015-1.5 2.063V21.5H16.2v-8h2.4v1.093h.033c.335-.634 1.153-1.3 2.374-1.3 2.539 0 3.007 1.671 3.007 3.843V21.5H24z"
        fill="white"
      />
    </svg>
  );
}

/** Webhooks icon - keep lucide-like style but custom for brand consistency */
export function WebhookBrandIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#6366F1" />
      <circle cx="10" cy="20" r="3" stroke="white" strokeWidth="1.5" fill="none" />
      <circle cx="22" cy="20" r="3" stroke="white" strokeWidth="1.5" fill="none" />
      <circle cx="16" cy="10" r="3" stroke="white" strokeWidth="1.5" fill="none" />
      <path d="M13 20h6M10 17l6-7M22 17l-6-7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
