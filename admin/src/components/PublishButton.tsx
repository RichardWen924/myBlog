import { useState } from 'react';

interface PublishButtonProps {
  topic: 'data' | 'blog';
  payload: Record<string, unknown>;
  defaultMessage?: string;
  onSuccess?: () => void;
  disabled?: boolean;
}

/** One-click publish: POST to sync API, show result. */
export default function PublishButton({
  topic,
  payload,
  defaultMessage,
  onSuccess,
  disabled,
}: PublishButtonProps) {
  const [message, setMessage] = useState(defaultMessage ?? '');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok?: boolean; error?: string; commit?: string } | null>(null);

  async function publish() {
    if (!message.trim()) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch(`/api/sync/${topic}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, message: message.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Sync failed');
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
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Commit message…"
        className="min-w-0 flex-1 rounded border border-[#E6E2DD] bg-white px-3 py-2 text-sm"
      />
      <button
        onClick={publish}
        disabled={busy || disabled || !message.trim()}
        className="shrink-0 rounded bg-[#5B7553] px-4 py-2 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? 'Publishing…' : 'Publish'}
      </button>
      {result?.ok && (
        <span className="text-xs text-[#5B7553]">✓ committed</span>
      )}
      {result?.error && (
        <span className="text-xs text-red-600">{result.error}</span>
      )}
    </div>
  );
}
