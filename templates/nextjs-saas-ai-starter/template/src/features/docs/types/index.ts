import type { LucideIcon } from 'lucide-react';

export interface DocPage {
  slug: string;
  titleKey: string;
  descriptionKey?: string;
  order: number;
}

export interface DocSection {
  id: string;
  titleKey: string;
  icon: LucideIcon;
  pages: DocPage[];
}

export interface DocFrontmatter {
  title: string;
  description?: string;
  section?: string;
  order?: number;
}

export interface DocContent {
  frontmatter: DocFrontmatter;
  content: string;
  slug: string;
}

export interface DocSearchItem {
  slug: string;
  title: string;
  description: string;
  section: string;
  content: string;
}

export interface DocHeading {
  id: string;
  text: string;
  level: number;
}

export interface DocNavItem {
  slug: string;
  titleKey: string;
  section: string;
}
