import projectsJson from './projects.json';

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

export default projectsJson.projects as Project[];
