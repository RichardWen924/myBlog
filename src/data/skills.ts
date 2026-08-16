import skillsJson from './skills.json';
import type { SkillCategory } from '../../packages/content-contracts/src';

export type { SkillCategory, SkillItem } from '../../packages/content-contracts/src';

const skills = skillsJson.skills satisfies SkillCategory[];

export default skills;
