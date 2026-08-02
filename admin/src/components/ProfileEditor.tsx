import { useEffect, useState } from 'react';
import { useTopicData } from '../lib/useTopicData';
import PublishButton from './PublishButton';
import type { Profile } from '../data-types';

export default function ProfileEditor() {
  const { data, loading, error, reload } = useTopicData<Profile>('profile');
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (data) setProfile(data);
  }, [data]);

  if (loading) return <Skeleton />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!profile) return null;

  function patch(next: Partial<Profile>) {
    setProfile({ ...profile, ...next });
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-bold text-ink">Profile</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded border border-border bg-white p-5">
          <Field label="Name">
            <input
              value={profile.name}
              onChange={(e) => patch({ name: e.target.value })}
              className={input}
            />
          </Field>
          <Field label="Title">
            <input
              value={profile.title}
              onChange={(e) => patch({ title: e.target.value })}
              className={input}
            />
          </Field>
          <Field label="Location">
            <input
              value={profile.location ?? ''}
              onChange={(e) => patch({ location: e.target.value })}
              className={input}
            />
          </Field>
          <Field label="Email">
            <input
              value={profile.email ?? ''}
              onChange={(e) => patch({ email: e.target.value })}
              className={input}
            />
          </Field>
          <Field label="Bio">
            <textarea
              value={profile.bio.join('\n')}
              onChange={(e) => patch({ bio: e.target.value.split('\n') })}
              rows={5}
              className={input}
            />
          </Field>
        </div>

        {/* Live preview */}
        <div className="rounded border border-border bg-white p-5">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-ink-soft">
            Preview
          </h2>
          <p className="font-serif text-3xl font-bold text-ink">{profile.name}</p>
          <p className="mt-1 text-ink-soft">{profile.title}</p>
          {profile.location && (
            <p className="mt-3 font-mono text-sm text-ink-soft">{profile.location}</p>
          )}
          <div className="mt-4 space-y-2 text-sm text-ink-soft">
            {profile.bio.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>

      <PublishButton
        topic="data"
        payload={{ topic: 'profile', data: profile }}
        defaultMessage="Update profile"
        onSuccess={reload}
      />
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

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-7 w-24 rounded bg-border" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded border border-border bg-white p-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <div className="mb-2 h-3 w-12 rounded bg-border" />
              <div className="h-9 w-full rounded bg-border" />
            </div>
          ))}
        </div>
        <div className="rounded border border-border bg-white p-5">
          <div className="mb-4 h-3 w-16 rounded bg-border" />
          <div className="mb-2 h-9 w-48 rounded bg-border" />
          <div className="h-5 w-32 rounded bg-border" />
        </div>
      </div>
    </div>
  );
}
