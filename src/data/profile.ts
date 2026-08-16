import profile from './profile.json';
import type { Profile } from '../../packages/content-contracts/src';

export type { Profile } from '../../packages/content-contracts/src';

const profileData = profile satisfies Profile;

export default profileData;
