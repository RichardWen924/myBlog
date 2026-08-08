import experienceJson from './experience.json';
import type { ExperienceItem } from '../../packages/content-contracts/src';

export type { ExperienceItem } from '../../packages/content-contracts/src';

export default experienceJson.experience as ExperienceItem[];
