import skillsJson from './skills.json';
import type { SkillCategory } from '../../packages/content-contracts/src';

export type { SkillCategory, SkillItem } from '../../packages/content-contracts/src';

export default skillsJson.skills as SkillCategory[];
