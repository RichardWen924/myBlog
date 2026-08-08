import type { ComponentType } from 'react';
import BlogEditor from '../components/BlogEditor';
import ExperienceEditor from '../components/ExperienceEditor';
import ProfileEditor from '../components/ProfileEditor';
import ProjectEditor from '../components/ProjectEditor';
import SkillsEditor from '../components/SkillsEditor';

export interface TopicDefinition {
  key: 'profile' | 'projects' | 'skills' | 'experience' | 'blog';
  path: string;
  label: string;
  editor: ComponentType;
}

export const topicRegistry: TopicDefinition[] = [
  { key: 'profile', path: '/profile', label: 'Profile', editor: ProfileEditor },
  { key: 'projects', path: '/projects', label: 'Projects', editor: ProjectEditor },
  { key: 'skills', path: '/skills', label: 'Skills', editor: SkillsEditor },
  { key: 'experience', path: '/experience', label: 'Experience', editor: ExperienceEditor },
  { key: 'blog', path: '/blog', label: 'Blog', editor: BlogEditor },
];
