import experienceJson from './experience.json';

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

export default experienceJson.experience as ExperienceItem[];
