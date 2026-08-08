import type { ComponentType, ReactNode } from 'react';

export type ModuleType =
  | 'hero'
  | 'profile'
  | 'skill'
  | 'project'
  | 'experience'
  | 'post'
  | 'trusted';

export interface ModuleEntry<T = Record<string, unknown>> {
  id: string;
  type: ModuleType;
  group: string;
  title: string;
  order: number;
  visible: boolean;
  sourceId?: string;
  data?: T;
}

export interface Profile {
  name: string;
  title: string;
  bio: string[];
  avatar?: string;
  location?: string;
  email?: string;
  socials: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  technologies: string[];
  url?: string;
  repo?: string;
  image?: string;
  featured: boolean;
  year: number;
}

export interface SkillItem {
  name: string;
  level?: number;
}

export interface SkillCategory {
  category: string;
  items: SkillItem[];
}

export interface ExperienceItem {
  type: 'work' | 'education';
  title: string;
  organization: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description: string[];
  technologies?: string[];
}

export interface TrustedModuleProps {
  data: Record<string, unknown>;
  module: ModuleEntry;
}

export interface TrustedModuleDefinition {
  id: string;
  title: string;
  Component: ComponentType<TrustedModuleProps>;
  render?: (props: TrustedModuleProps) => ReactNode;
}
