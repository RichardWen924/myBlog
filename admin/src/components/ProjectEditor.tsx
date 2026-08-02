import { useEffect, useState } from 'react';
import { useTopicData } from '../lib/useTopicData';
import PublishButton from './PublishButton';
import type { Project } from '../data-types';

export default function ProjectEditor() {
  const { data, loading, error, reload } = useTopicData<{ projects: Project[] }>('projects');
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (data) setProjects(data.projects);
  }, [data]);

  if (loading) return <Skeleton />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!projects) return null;

  const selected = projects.find((p) => p.id === selectedId) ?? null;

  function patchProject(id: string, next: Partial<Project>) {
    setProjects(projects.map((p) => (p.id === id ? { ...p, ...next } : p)));
  }

  function addProject() {
    const id = `project-${Date.now().toString().slice(-4)}`;
    const fresh: Project = {
      id,
      title: 'New Project',
      description: '',
      technologies: [],
      featured: false,
      year: new Date().getFullYear(),
    };
    setProjects([...projects, fresh]);
    setSelectedId(id);
  }

  function deleteProject(id: string) {
    setProjects(projects.filter((p) => p.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-bold text-ink">Projects</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: list */}
        <div className="rounded border border-border bg-white p-4">
          <ul className="divide-y divide-border">
            {projects.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => setSelectedId(p.id)}
                  className={`flex w-full items-baseline gap-3 px-2 py-3 text-left transition-colors ${
                    selectedId === p.id ? 'bg-accent/10' : 'hover:bg-border/30'
                  }`}
                >
                  <span className="font-serif font-semibold text-ink">{p.title}</span>
                  <span className="text-xs text-ink-soft">{p.year}</span>
                  {p.featured && (
                    <span className="ml-auto text-xs text-accent">★</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={addProject}
            className="mt-3 w-full rounded border border-accent px-3 py-2 text-sm text-accent transition-colors hover:bg-accent/10"
          >
            + New project
          </button>
        </div>

        {/* Right: editor for selected */}
        {selected ? (
          <div className="space-y-4 rounded border border-border bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-ink">{selected.title}</h2>
              <button
                onClick={() => deleteProject(selected.id)}
                className="text-xs text-red-600 transition-colors hover:text-red-800"
              >
                Delete
              </button>
            </div>
            <Field label="Title">
              <input
                value={selected.title}
                onChange={(e) => patchProject(selected.id, { title: e.target.value })}
                className={input}
              />
            </Field>
            <Field label="Description">
              <textarea
                value={selected.description}
                onChange={(e) => patchProject(selected.id, { description: e.target.value })}
                rows={2}
                className={input}
              />
            </Field>
            <Field label="Long description">
              <textarea
                value={selected.longDescription ?? ''}
                onChange={(e) => patchProject(selected.id, { longDescription: e.target.value })}
                rows={4}
                className={input}
              />
            </Field>
            <Field label="Technologies (comma separated)">
              <input
                value={selected.technologies.join(', ')}
                onChange={(e) =>
                  patchProject(selected.id, {
                    technologies: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className={input}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Year">
                <input
                  type="number"
                  value={selected.year}
                  onChange={(e) => patchProject(selected.id, { year: Number(e.target.value) })}
                  className={input}
                />
              </Field>
              <Field label="Repo URL">
                <input
                  value={selected.repo ?? ''}
                  onChange={(e) => patchProject(selected.id, { repo: e.target.value })}
                  className={input}
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={selected.featured}
                onChange={(e) => patchProject(selected.id, { featured: e.target.checked })}
                className="accent-accent"
              />
              Featured on home
            </label>
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-ink-soft">Select a project to edit.</p>
        )}
      </div>

      <PublishButton
        topic="data"
        payload={{ topic: 'projects', data: { projects } }}
        defaultMessage="Update projects"
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
      <div className="h-7 w-28 rounded bg-border" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded border border-border bg-white p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 w-full rounded bg-border" />
          ))}
        </div>
        <div className="space-y-4 rounded border border-border bg-white p-5">
          {Array.from({ length: 6 }).map((_, i) => {
            const h = i === 3 || i === 4 ? 'h-16' : 'h-9';
            return <div key={i} className={`${h} w-full rounded bg-border`} />;
          })}
        </div>
      </div>
    </div>
  );
}
