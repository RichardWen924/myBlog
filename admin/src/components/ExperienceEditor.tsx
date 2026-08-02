import { useEffect, useState } from 'react';
import { useTopicData } from '../lib/useTopicData';
import PublishButton from './PublishButton';
import type { ExperienceItem } from '../data-types';

export default function ExperienceEditor() {
  const { data, loading, error, reload } = useTopicData<{ experience: ExperienceItem[] }>('experience');
  const [items, setItems] = useState<ExperienceItem[] | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (data) setItems(data.experience);
  }, [data]);

  if (loading) return <Skeleton />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!items) return null;

  const selected = selectedId != null ? items[selectedId] : null;

  function patch(idx: number, next: Partial<ExperienceItem>) {
    setItems(items.map((it, i) => (i === idx ? { ...it, ...next } : it)));
  }

  function add() {
    const fresh: ExperienceItem = {
      type: 'work',
      title: 'New Role',
      organization: '',
      startDate: new Date().getFullYear().toString(),
      description: [],
    };
    const next = [fresh, ...items];
    setItems(next);
    setSelectedId(0);
  }

  function remove(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
    if (selectedId === idx) setSelectedId(null);
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-bold text-ink">Experience</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded border border-border bg-white p-4">
          <ul className="divide-y divide-border">
            {items.map((it, i) => (
              <li key={i}>
                <button
                  onClick={() => setSelectedId(i)}
                  className={`flex w-full items-baseline gap-3 px-2 py-3 text-left transition-colors ${
                    selectedId === i ? 'bg-accent/10' : 'hover:bg-border/30'
                  }`}
                >
                  <span className="font-serif font-semibold text-ink">{it.title}</span>
                  <span className="text-xs text-ink-soft">{it.organization}</span>
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={add}
            className="mt-3 w-full rounded border border-accent px-3 py-2 text-sm text-accent transition-colors hover:bg-accent/10"
          >
            + New entry
          </button>
        </div>

        {selected ? (
          <div className="space-y-4 rounded border border-border bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-ink">{selected.title}</h2>
              <button
                onClick={() => remove(selectedId!)}
                className="text-xs text-red-600 transition-colors hover:text-red-800"
              >
                Delete
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Title">
                <input
                  value={selected.title}
                  onChange={(e) => patch(selectedId!, { title: e.target.value })}
                  className={input}
                />
              </Field>
              <Field label="Organization">
                <input
                  value={selected.organization}
                  onChange={(e) => patch(selectedId!, { organization: e.target.value })}
                  className={input}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Start (YYYY-MM)">
                <input
                  value={selected.startDate}
                  onChange={(e) => patch(selectedId!, { startDate: e.target.value })}
                  className={input}
                />
              </Field>
              <Field label="End (leave empty = present)">
                <input
                  value={selected.endDate ?? ''}
                  onChange={(e) => patch(selectedId!, { endDate: e.target.value || undefined })}
                  className={input}
                />
              </Field>
            </div>
            <Field label="Type">
              <select
                value={selected.type}
                onChange={(e) => patch(selectedId!, { type: e.target.value as 'work' | 'education' })}
                className={input}
              >
                <option value="work">Work</option>
                <option value="education">Education</option>
              </select>
            </Field>
            <Field label="Description (one per line)">
              <textarea
                value={selected.description.join('\n')}
                onChange={(e) =>
                  patch(selectedId!, { description: e.target.value.split('\n').filter(Boolean) })
                }
                rows={4}
                className={input}
              />
            </Field>
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-ink-soft">Select an entry to edit.</p>
        )}
      </div>

      <PublishButton
        topic="data"
        payload={{ topic: 'experience', data: { experience: items } }}
        defaultMessage="Update experience"
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
      <div className="h-7 w-32 rounded bg-border" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded border border-border bg-white p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 w-full rounded bg-border" />
          ))}
        </div>
        <div className="space-y-4 rounded border border-border bg-white p-5">
          {Array.from({ length: 5 }).map((_, i) => {
            const h = i === 4 ? 'h-24' : 'h-9';
            return <div key={i} className={`${h} w-full rounded bg-border`} />;
          })}
        </div>
      </div>
    </div>
  );
}
