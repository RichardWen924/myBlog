import skillsJson from './skills.json';

export interface SkillItem {
  name: string;
  level?: number; // 1-5, optional
}

export interface SkillCategory {
  category: string;
  items: SkillItem[];
}

export default skillsJson.skills as SkillCategory[];
