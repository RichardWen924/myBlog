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

const projects: Project[] = [
  {
    id: 'my-blog',
    title: 'This Blog',
    description: 'A personal blog built with Astro, Tailwind, and React.',
    longDescription:
      'A content-first personal site with an extensible Content Layer, zero-JS blog pages, and interactive React islands for the portfolio sections.',
    technologies: ['Astro', 'TypeScript', 'Tailwind', 'React'],
    repo: 'https://github.com/RichardWen924/myBlog',
    featured: true,
    year: 2026,
  },
];

export default projects;
