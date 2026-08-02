import { useEffect, useState } from 'react';
import { useTopicData } from '../lib/useTopicData';
import PublishButton from './PublishButton';
import type { SkillCategory, SkillItem } from '../data-types';

export default function SkillsEditor() {
  const { data, loading, error, reload } = useTopicData<SkillCategory[]>('skills');
  const [skills, setSkills] = useState<SkillCategory[] | null>(null);

  useEffect(() => {
    if (data) setSkills(data);
  }, [data]);

  if (loading) return <p className="text-sm text-[#6B6B6B]">Loading…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!skills) return null;

  function patch(next: SkillCategory[]) {
    setSkills(next);
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-bold">Skills</h1>
      <div className="space-y-6">
        {skills.map((cat, ci) => (
          <div
            key={ci}
            className="rounded border border-[#E6E2DD] bg-white p-5"
          >
            <div className="mb-4 flex items-center gap-2">
              <input
                value={cat.category}
                onChange={(e) => {
                  const next = [...skills];
                  next[ci] = { ...cat, category: e.target.value };
                  patch(next);
                }}
                className={input}
              />
              <button
                onClick={() => patch(skills.filter((_, i) => i !== ci))}
                className="shrink-0 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
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
                    className={`${input} w-40`}
                  />
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={item.level ?? 1}
                    onChange={(e) => {
                      const next = [...skills];
                      next[ci].items[si] = {
                        ...item,
                        level: Number(e.target.value),
                      };
                      patch(next);
                    }}
                    className="flex-1 accent-[#5B7553]"
                  />
                  <span className="w-8 text-right font-mono text-xs text-[#6B6B6B]">
                    {item.level ?? 1}/5
                  </span>
                  <button
                    onClick={() => {
                      const next = [...skills];
                      next[ci].items = next[ci].items.filter((_, i) => i !== si);
                      patch(next);
                    }}
                    className="shrink-0 text-xs text-red-600 hover:text-red-800"
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
              className="mt-3 text-xs text-[#5B7553] hover:underline"
            >
              + Add skill
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => patch([...skills, { category: 'New Category', items: [] }])}
        className="mt-4 rounded border border-[#5B7553] px-3 py-1.5 text-sm text-[#5B7553] hover:bg-[#5B7553]/10"
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
  'rounded border border-[#E6E2DD] bg-white px-3 py-2 text-sm focus:border-[#5B7553] focus:outline-none';
