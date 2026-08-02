export interface ExperienceItem {
  type: 'work' | 'education';
  title: string;
  organization: string;
  location?: string;
  startDate: string; // "2023-06"
  endDate?: string; // undefined means "Present"
  description: string[];
  technologies?: string[];
}

const experience: ExperienceItem[] = [
  {
    type: 'work',
    title: 'Software Engineer',
    organization: 'Your Company',
    startDate: '2023-06',
    description: ['Built features with React and TypeScript.'],
    technologies: ['React', 'TypeScript', 'Node.js'],
  },
];

export default experience;
