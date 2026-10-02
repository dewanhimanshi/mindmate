import { useStore } from '@nanostores/react';
import { useCallback, useEffect, useState } from 'react';
import type { Repo } from './model';
import { $child, $session, repoFor } from './session';

/** Load data for the active child; re-runs when the child or `deps` change. */
export function useChildQuery<T>(load: (repo: Repo, childId: string) => Promise<T>, deps: unknown[] = []) {
  const session = useStore($session);
  const child = useStore($child);
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!child || (session.status !== 'user' && session.status !== 'guest')) return;
    let cancelled = false;
    setLoading(true);
    repoFor(session)
      .then((repo) => load(repo, child.id))
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) setError(e);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child?.id, session.status, tick, ...deps]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, reload, setData };
}

/** Run a write against the active child's repo. */
export async function withChild<T>(fn: (repo: Repo, childId: string) => Promise<T>): Promise<T> {
  const child = $child.get();
  if (!child) throw new Error('No active profile');
  const repo = await repoFor($session.get());
  return fn(repo, child.id);
}
