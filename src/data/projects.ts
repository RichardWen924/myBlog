import projectsJson from './projects.json';
import type { Project } from '../../packages/content-contracts/src';

export type { Project } from '../../packages/content-contracts/src';

export default projectsJson.projects as Project[];
