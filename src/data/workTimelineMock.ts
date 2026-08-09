import type { ExperienceItem } from '../../packages/content-contracts/src';

/** Temporary visual data for the Work "Who am i" chapter. Replace when verified history is ready. */
const workTimelineMock: ExperienceItem[] = [
  {
    type: 'education',
    title: 'Computer Science',
    organization: 'University of Future',
    location: 'Shanghai',
    startDate: '2018-09',
    endDate: '2022-06',
    description: ['Built a foundation in software engineering, systems and computation.'],
  },
  {
    type: 'work',
    title: 'Backend Engineering Intern',
    organization: 'Northstar Labs',
    location: 'Shanghai',
    startDate: '2021-07',
    endDate: '2021-12',
    description: ['Worked on APIs and data services while learning how production systems hold together.'],
  },
  {
    type: 'education',
    title: 'Distributed Systems Research',
    organization: 'Independent study',
    startDate: '2022-09',
    endDate: '2023-03',
    description: ['Followed questions about reliable systems, tools and the shape of useful abstractions.'],
  },
  {
    type: 'work',
    title: 'Agent Platform Intern',
    organization: 'Openfield Studio',
    location: 'Remote',
    startDate: '2023-03',
    endDate: '2023-06',
    description: ['Explored how agent workflows can turn ideas into dependable tools.'],
  },
];

export default workTimelineMock;
