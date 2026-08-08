import { useEffect, useMemo, useState } from 'react';
import PublishButton from './PublishButton';
import type { ModuleEntry } from '../data-types';

interface ModulesEditorProps {
  group?: string;
}

export default function ModulesEditor({ group }: ModulesEditorProps) {
  const [modules, setModules] = useState<ModuleEntry[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sources, setSources] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dataDraft, setDataDraft] = useState('');

  async function load() {
    setError(null);
    try {
      const res = await fetch('/api/modules');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setModules(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  const selected = modules?.find((module) => module.id === selectedId) ?? null;

  useEffect(() => {
    if (selected) setDataDraft(JSON.stringify(selected.data ?? {}, null, 2));
  }, [selectedId, selected?.data]);

  const visibleModules = useMemo(
    () => (modules ?? []).filter((module) => !group || module.group === group),
    [modules, group],
  );

  function updateModule(id: string, next: Partial<ModuleEntry>) {
    setModules((current) =>
      current?.map((module) => (module.id === id ? { ...module, ...next } : module)) ?? null,
    );
  }

  function reorder(fromId: string, toId: string) {
    if (!modules || fromId === toId) return;
    const next = [...modules];
    const from = next.findIndex((module) => module.id === fromId);
    const to = next.findIndex((module) => module.id === toId);
    if (from < 0 || to < 0) return;
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setModules(next.map((module, index) => ({ ...module, order: index * 10 })));
  }

  function moveBy(id: string, delta: number) {
    if (!modules) return;
    const index = modules.findIndex((module) => module.id === id);
    const nextIndex = index + delta;
    if (index < 0 || nextIndex < 0 || nextIndex >= modules.length) return;
    reorder(id, modules[nextIndex].id);
  }

  function addModule() {
    const id = `custom-${Date.now().toString().slice(-6)}`;
    const next: ModuleEntry = {
      id,
      type: 'trusted',
      group: 'custom',
      title: 'New Module',
      order: (modules?.length ?? 0) * 10,
      visible: true,
      data: {},
    };
    setModules([...(modules ?? []), next]);
    setSelectedId(id);
  }

  async function loadSource(file: File) {
    if (!selected) return;
    if (!file.name.endsWith('.ts')) {
      setError('Only .ts module files are supported.');
      return;
    }
    const source = await file.text();
    setSources((current) => ({ ...current, [selected.id]: source }));
    updateModule(selected.id, { type: 'trusted' });
    setError(null);
  }

  if (error && !modules) return <p className="text-sm text-red-600">{error}</p>;
  if (!modules) return <Skeleton />;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink">{group ? `${group} Modules` : 'Modules'}</h1>
          <p className="mt-1 text-sm text-ink-soft">Drag modules to change their display order.</p>
        </div>
        {!group && (
          <button onClick={addModule} className="rounded border border-accent px-3 py-2 text-sm text-accent hover:bg-accent/10">
            + New module
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
        <div className="rounded border border-border bg-white p-3">
          <ul className="space-y-1" aria-label="Modules">
            {visibleModules.map((module) => (
              <li
                key={module.id}
                draggable
                onDragStart={() => setDragId(module.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (dragId) reorder(dragId, module.id);
                  setDragId(null);
                }}
                className={`rounded border px-3 py-3 transition-colors ${selectedId === module.id ? 'border-accent bg-accent/5' : 'border-transparent hover:border-border'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="cursor-grab text-ink-soft" aria-label="Drag module">⋮⋮</span>
                  <button onClick={() => setSelectedId(module.id)} className="min-w-0 flex-1 text-left">
                    <span className="block truncate font-serif font-semibold text-ink">{module.title}</span>
                    <span className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">{module.type} · {module.id}</span>
                  </button>
                  <button
                    onClick={() => updateModule(module.id, { visible: !module.visible })}
                    className={`rounded px-2 py-1 text-xs ${module.visible ? 'text-accent hover:bg-accent/10' : 'text-ink-soft hover:bg-border/40'}`}
                    aria-label={`${module.visible ? 'Hide' : 'Show'} ${module.title}`}
                  >
                    {module.visible ? 'Shown' : 'Hidden'}
                  </button>
                  <div className="flex gap-1">
                    <button onClick={() => moveBy(module.id, -1)} className="rounded px-1.5 text-xs text-ink-soft hover:bg-border/40" aria-label="Move up">↑</button>
                    <button onClick={() => moveBy(module.id, 1)} className="rounded px-1.5 text-xs text-ink-soft hover:bg-border/40" aria-label="Move down">↓</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {selected ? (
          <div className="space-y-4 rounded border border-border bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-ink">Edit module</h2>
              <span className="font-mono text-xs text-ink-soft">{selected.id}</span>
            </div>
            <Field label="Title">
              <input value={selected.title} onChange={(event) => updateModule(selected.id, { title: event.target.value })} className={input} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Group">
                <input value={selected.group} onChange={(event) => updateModule(selected.id, { group: event.target.value })} className={input} />
              </Field>
              <Field label="Type">
                <input value={selected.type} readOnly className={`${input} bg-border/20`} />
              </Field>
            </div>
            {selected.sourceId && (
              <Field label="Source ID">
                <input value={selected.sourceId} onChange={(event) => updateModule(selected.id, { sourceId: event.target.value })} className={input} />
              </Field>
            )}
            <Field label="Module data (JSON)">
              <textarea
                value={dataDraft}
                onChange={(event) => {
                  setDataDraft(event.target.value);
                  try {
                    updateModule(selected.id, { data: JSON.parse(event.target.value) });
                    setError(null);
                  } catch {
                    setError('Module data must be valid JSON before publishing.');
                  }
                }}
                rows={12}
                className={`${input} font-mono text-xs`}
              />
            </Field>
            {selected.type === 'trusted' && (
              <Field label="Trusted TypeScript source">
                <input type="file" accept=".ts" onChange={(event) => event.target.files?.[0] && loadSource(event.target.files[0])} className="block w-full text-sm text-ink-soft" />
                {sources[selected.id] && <p className="mt-2 text-xs text-accent">Source ready to publish.</p>}
              </Field>
            )}
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-ink-soft">Select a module to edit.</p>
        )}
      </div>

      <PublishButton
        topic="modules"
        payload={{ modules, sources }}
        defaultMessage="Update modules"
        onSuccess={load}
        disabled={Boolean(error)}
      />
    </div>
  );
}

const input = 'w-full rounded border border-border bg-white px-3 py-2 text-sm transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-ink-soft">{label}</span>{children}</label>;
}

function Skeleton() {
  return <div className="animate-pulse space-y-4"><div className="h-7 w-32 rounded bg-border" /><div className="h-64 rounded border border-border bg-white" /></div>;
}
