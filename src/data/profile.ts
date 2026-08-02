import profile from './profile.json';

export interface Profile {
  name: string;
  title: string;
  bio: string[];
  avatar?: string;
  location?: string;
  email?: string;
  socials: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}

export default profile as Profile;
