import experienceJson from './experience.json';
import type { ExperienceItem } from '../../packages/content-contracts/src';

export type { ExperienceItem } from '../../packages/content-contracts/src';

type RawExperienceItem = (typeof experienceJson.experience)[number] & { endDate?: string };

const experience = experienceJson.experience.map((item: RawExperienceItem) => {
  const type = item.type === 'education'
    ? 'education'
    : item.type === 'work'
      ? 'work'
      : (() => { throw new Error(`Unsupported experience type: ${item.type}`); })();

  return { ...item, type, endDate: item.endDate };
}) satisfies ExperienceItem[];

export default experience;
