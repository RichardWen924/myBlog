import { useEffect, useState } from 'react';
import PublishButton from './PublishButton';

interface PostMeta {
  slug: string;
  title: string;
  date: string;
  draft: boolean;
  tags: string[];
  description: string;
}

interface PostDetail {
  slug: string;
  data: {
    title: string;
    description?: string;
    date?: string;
    tags?: string[];
    draft?: boolean;
  };
  content: string;
}

export default function BlogEditor() {
  const [posts, setPosts] = useState<PostMeta[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [detail, setDetail] = useState<PostDetail | null>(null);

  async function loadPosts() {
    try {
      const res = await fetch('/api/blog');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setPosts(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function select(slug: string) {
    setSelectedSlug(slug);
    setError(null);
    try {
      const res = await fetch(`/api/blog/${slug}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDetail(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setDetail(null);
    }
  }

  function patchDetail(next: Partial<PostDetail>) {
    if (!detail) return;
    setDetail({ ...detail, ...next });
  }

  if (error && !posts) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-bold text-ink">Blog Posts</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: post list */}
        <div className="rounded border border-border bg-white p-4">
          <ul className="divide-y divide-border">
            {(posts ?? []).map((p) => (
              <li key={p.slug}>
                <button
                  onClick={() => select(p.slug)}
                  className={`flex w-full items-baseline gap-3 px-2 py-3 text-left transition-colors ${
                    selectedSlug === p.slug ? 'bg-accent/10' : 'hover:bg-border/30'
                  }`}
                >
                  <span className="font-serif font-semibold text-ink">{p.title}</span>
                  <span className="font-mono text-xs text-ink-soft">{p.date}</span>
                  {p.draft && (
                    <span className="ml-auto text-xs text-warm">draft</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: editor */}
        {detail ? (
          <div className="space-y-4 rounded border border-border bg-white p-5">
            <h2 className="font-serif text-lg font-semibold text-ink">
              {detail.data.title}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Slug">
                <input
                  value={detail.slug}
                  onChange={(e) => patchDetail({ slug: e.target.value })}
                  className={input}
                />
              </Field>
              <Field label="Date (YYYY-MM-DD)">
                <input
                  value={detail.data.date ?? ''}
                  onChange={(e) =>
                    patchDetail({ data: { ...detail.data, date: e.target.value } })
                  }
                  className={input}
                />
              </Field>
            </div>
            <Field label="Title">
              <input
                value={detail.data.title}
                onChange={(e) =>
                  patchDetail({ data: { ...detail.data, title: e.target.value } })
                }
                className={input}
              />
            </Field>
            <Field label="Description">
              <textarea
                value={detail.data.description ?? ''}
                onChange={(e) =>
                  patchDetail({ data: { ...detail.data, description: e.target.value } })
                }
                rows={2}
                className={input}
              />
            </Field>
            <Field label="Tags (comma separated)">
              <input
                value={(detail.data.tags ?? []).join(', ')}
                onChange={(e) =>
                  patchDetail({
                    data: {
                      ...detail.data,
                      tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    },
                  })
                }
                className={input}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={detail.data.draft ?? false}
                onChange={(e) =>
                  patchDetail({ data: { ...detail.data, draft: e.target.checked } })
                }
                className="accent-accent"
              />
              Draft (hidden from site)
            </label>
            <Field label="Markdown content">
              <textarea
                value={detail.content}
                onChange={(e) => patchDetail({ content: e.target.value })}
                rows={14}
                className={`${input} font-mono text-xs`}
              />
            </Field>

            <PublishButton
              topic="blog"
              payload={{
                slug: detail.slug,
                originalSlug: selectedSlug ?? detail.slug,
                data: {
                  title: detail.data.title,
                  description: detail.data.description ?? '',
                  date: detail.data.date ?? '',
                  tags: detail.data.tags ?? [],
                  draft: detail.data.draft ?? false,
                },
                content: detail.content,
              }}
              defaultMessage={`Update post: ${detail.data.title}`}
              onSuccess={() => loadPosts()}
            />
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-ink-soft">
            Select a post to edit.
          </p>
        )}
      </div>
    </div>
  );
}

const input =
  'w-full rounded border border-border bg-white px-3 py-2 text-sm transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink-soft">{label}</span>
      {children}
    </label>
  );
}
