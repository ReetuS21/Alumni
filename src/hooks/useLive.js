import { useEffect, useState } from "react";
import { onSnapshot } from "firebase/firestore";

/**
 * Subscribes to a Firestore query and keeps it live.
 * `buildQuery` may return null to skip (e.g. while the user is not known yet).
 */
export const useLiveQuery = (buildQuery, deps = []) => {
  const [state, setState] = useState({ data: null, error: null });

  useEffect(() => {
    const q = buildQuery();
    if (!q) {
      setState({ data: [], error: null });
      return undefined;
    }
    return onSnapshot(
      q,
      (snap) => setState({ data: snap.docs.map((d) => ({ id: d.id, ...d.data() })), error: null }),
      (error) => {
        console.error("Live query failed:", error);
        setState({ data: [], error });
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data: state.data || [], loading: state.data === null, error: state.error };
};

/** Subscribes to a single Firestore document. `buildRef` may return null to skip. */
export const useLiveDoc = (buildRef, deps = []) => {
  const [state, setState] = useState({ data: undefined, error: null });

  useEffect(() => {
    const ref = buildRef();
    if (!ref) {
      setState({ data: null, error: null });
      return undefined;
    }
    return onSnapshot(
      ref,
      (snap) => setState({ data: snap.exists() ? { id: snap.id, ...snap.data() } : null, error: null }),
      (error) => {
        console.error("Live document failed:", error);
        setState({ data: null, error });
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data: state.data ?? null, loading: state.data === undefined, error: state.error };
};
