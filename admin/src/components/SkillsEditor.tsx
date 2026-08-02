import { useEffect, useState } from 'react';
import { useTopicData } from '../lib/useTopicData';
import PublishButton from './PublishButton';
import type { SkillCategory } from '../data-types';

export default function SkillsEditor() {
  const { data, loading, error, reload } = useTopicData<SkillCategory[]>('skills');
  const [skills, setSkills] = useState<SkillCategory[] | null>(null);

  useEffect(() => {
    if (data) setSkills(data);
  }, [data]);

  if (loading) return <Skeleton />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!skills) return null;

  function patch(next: SkillCategory[]) {
    setSkills(next);
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-bold text-ink">Skills</h1>
      <div className="space-y-6">
        {skills.map((cat, ci) => (
          <div key={ci} className="rounded border border-border bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <input
                value={cat.category}
                onChange={(e) => {
                  const next = [...skills];
                  next[ci] = { ...cat, category: e.target.value };
                  patch(next);
                }}
                className={`${input} font-serif text-sm font-semibold`}
              />
              <button
                onClick={() => patch(skills.filter((_, i) => i !== ci))}
                className="shrink-0 rounded px-2 py-1 text-xs text-red-600 transition-colors hover:bg-red-50"
              >
                Remove
              </button>
            </div>
            <div className="space-y-2">
              {cat.items.map((item, si) => (
                <div key={si} className="flex items-center gap-3">
                  <input
                    value={item.name}
                    onChange={(e) => {
                      const next = [...skills];
                      next[ci].items[si] = { ...item, name: e.target.value };
                      patch(next);
                    }}
                    className={`${input} w-32`}
                  />
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={item.level ?? 1}
                    onChange={(e) => {
                      const next = [...skills];
                      next[ci].items[si] = { ...item, level: Number(e.target.value) };
                      patch(next);
                    }}
                    className="flex-1 accent-accent"
                  />
                  <span className="w-8 text-right font-mono text-xs text-ink-soft">
                    {item.level ?? 1}/5
                  </span>
                  <button
                    onClick={() => {
                      const next = [...skills];
                      next[ci].items = next[ci].items.filter((_, i) => i !== si);
                      patch(next);
                    }}
                    className="shrink-0 text-xs text-red-600 transition-colors hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                const next = [...skills];
                next[ci].items.push({ name: '', level: 3 });
                patch(next);
              }}
              className="mt-3 text-xs text-accent transition-colors hover:underline"
            >
              + Add skill
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => patch([...skills, { category: 'New Category', items: [] }])}
        className="mt-4 rounded border border-accent px-3 py-1.5 text-sm text-accent transition-colors hover:bg-accent/10"
      >
        + Add category
      </button>

      <PublishButton
        topic="data"
        payload={{ topic: 'skills', data: skills }}
        defaultMessage="Update skills"
        onSuccess={reload}
      />
    </div>
  );
}

const input =
  'rounded border border-border bg-white px-3 py-2 text-sm transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30';

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-7 w-20 rounded bg-border" />
      {Array.from({ length: 3 }).map((_, ci) => (
        <div key={ci} className="space-y-3 rounded border border-border bg-white p-5">
          <div className="h-8 w-40 rounded bg-border" />
          {Array.from({ length: 3 }).map((_, si) => (
            <div key={si} className="flex items-center gap-3">
              <div className="h-9 w-32 rounded bg-border" />
              <div className="h-4 flex-1 rounded bg-border" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
