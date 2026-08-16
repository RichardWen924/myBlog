import projectsJson from './projects.json';
import type { Project } from '../../packages/content-contracts/src';

export type { Project } from '../../packages/content-contracts/src';

const projects = projectsJson.projects satisfies Project[];

export default projects;
