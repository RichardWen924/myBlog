export interface SkillItem {
  name: string;
  level?: number; // 1-5, optional
}

export interface SkillCategory {
  category: string;
  items: SkillItem[];
}

const skills: SkillCategory[] = [
  {
    category: 'Languages',
    items: [
      { name: 'TypeScript', level: 5 },
      { name: 'JavaScript', level: 5 },
      { name: 'Python', level: 3 },
    ],
  },
  {
    category: 'Frontend',
    items: [
      { name: 'React', level: 5 },
      { name: 'Astro', level: 4 },
      { name: 'Tailwind', level: 5 },
      { name: 'Next.js', level: 4 },
    ],
  },
  {
    category: 'Tools',
    items: [
      { name: 'Git', level: 5 },
      { name: 'Figma', level: 3 },
      { name: 'Docker', level: 3 },
    ],
  },
];

export default skills;
