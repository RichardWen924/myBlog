import rss from '@astrojs/rss';
import { getPublishedPosts } from '../lib/content';
import { SITE_TITLE, SITE_DESCRIPTION, SITE_URL } from '../lib/constants';
import { withBasePath } from '../lib/sitePath';

export async function GET() {
  const posts = await getPublishedPosts();
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: SITE_URL,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: withBasePath(`/blog/${post.id}`),
    })),
    customData: '<language>en</language>',
  });
}
