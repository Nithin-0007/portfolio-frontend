"use client";

import { useRef, useState } from "react";
import styles from "./ConfirmDialog.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  icon?: string;
}

interface DialogState extends ConfirmOptions {
  loading: boolean;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useConfirm() {
  const [state, setState] = useState<DialogState | null>(null);
  const resolveRef = useRef<((v: boolean) => void) | null>(null);

  /** Drop-in replacement for window.confirm() — returns a Promise<boolean> */
  const confirm = (options: ConfirmOptions | string): Promise<boolean> => {
    const opts: ConfirmOptions =
      typeof options === "string" ? { title: options, danger: true } : options;

    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({ ...opts, loading: false });
    });
  };

  const handleClose = (result: boolean) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setState(null);
  };

  const setLoading = (v: boolean) =>
    setState((s) => s ? { ...s, loading: v } : s);

  const dialog = state ? (
    <ConfirmDialog
      title={state.title}
      message={state.message}
      confirmLabel={state.confirmLabel}
      cancelLabel={state.cancelLabel}
      danger={state.danger}
      icon={state.icon}
      loading={state.loading}
      onConfirm={() => handleClose(true)}
      onCancel={() => handleClose(false)}
    />
  ) : null;

  return { confirm, dialog, setLoading };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ConfirmDialogProps extends ConfirmOptions {
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  danger = false,
  icon,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const defaultIcon = danger ? "⚠" : "◆";
  const defaultConfirm = danger ? "Delete" : "Confirm";

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className={`${styles.card} ${danger ? styles.danger : ""}`}>
        <div className={styles.iconWrap}>{icon || defaultIcon}</div>
        <div className={styles.title}>{title}</div>
        {message && <div className={styles.message}>{message}</div>}
        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button className={styles.btnConfirm} onClick={onConfirm} disabled={loading}>
            {loading && <span className={styles.spinner} />}
            {confirmLabel || defaultConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}
