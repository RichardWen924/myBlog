import { useState } from 'react';

interface SaveButtonProps {
  topic: 'data' | 'blog';
  payload: Record<string, unknown>;
  onSuccess?: () => void;
  disabled?: boolean;
}

export default function SaveButton({ topic, payload, onSuccess, disabled }: SaveButtonProps) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok?: boolean; error?: string } | null>(null);

  async function save() {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch(`/api/save/${topic}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Save failed');
      setResult(json);
      onSuccess?.();
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 flex items-center gap-3">
      <button
        onClick={save}
        disabled={busy || disabled}
        className="shrink-0 rounded bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? 'Saving…' : 'Save changes'}
      </button>
      {result?.ok && <span className="text-xs text-accent">✓ saved locally</span>}
      {result?.error && <span className="text-xs text-red-600">{result.error}</span>}
    </div>
  );
}
