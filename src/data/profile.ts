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

const profile: Profile = {
  name: 'Richard',
  title: 'Frontend Developer',
  bio: [
    'I build things for the web with a focus on performance and design.',
    'Currently exploring the Astro ecosystem and generative art.',
  ],
  location: 'Shanghai, China',
  email: 'hello@example.com',
  socials: {
    github: 'https://github.com/RichardWen924',
    email: 'mailto:hello@example.com',
  },
};

export default profile;
