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
  endDate?: string | undefined;
  description: string[];
  technologies?: string[];
}

export type ContentTopic = 'profile' | 'projects' | 'skills' | 'experience';

export interface ContentPayloadMap {
  profile: Profile;
  projects: { projects: Project[] };
  skills: { skills: SkillCategory[] };
  experience: { experience: ExperienceItem[] };
}

export type ContentPayload<Topic extends ContentTopic> = ContentPayloadMap[Topic];
