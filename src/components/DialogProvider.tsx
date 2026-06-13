import React, { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { AppDialog, DialogConfig, DialogButton } from './AppDialog';
import { c } from './tokens';

interface DialogContextValue {
  /** Show a generic dialog with custom buttons */
  showDialog: (config: DialogConfig) => void;
  /** Show a confirm dialog (lime accent, Annuler + Confirmer) */
  showConfirm: (opts: {
    title: string;
    message?: string;
    confirmText?: string;
    accentColor?: string;
    onConfirm: () => void;
  }) => void;
  /** Show a destructive dialog (red accent, Annuler + destructive action) */
  showDestructive: (opts: {
    title: string;
    message?: string;
    confirmText?: string;
    onConfirm: () => void;
  }) => void;
  /** Dismiss the current dialog */
  dismiss: () => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);
export function DialogProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<DialogConfig | null>(null);
  const dismissTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    setVisible(false);
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
    }
    dismissTimeoutRef.current = setTimeout(() => {
      setConfig(null);
      dismissTimeoutRef.current = null;
    }, 200);
  }, []);

  const showDialog = useCallback((cfg: DialogConfig) => {
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
      dismissTimeoutRef.current = null;
    }
    setConfig(cfg);
    setVisible(true);
  }, []);
  const showConfirm = useCallback(
    ({
      title,
      message,
      confirmText = 'Confirmer',
      accentColor = c.lime,
      onConfirm,
    }: {
      title: string;
      message?: string;
      confirmText?: string;
      accentColor?: string;
      onConfirm: () => void;
    }) => {
      showDialog({
        title,
        message,
        accentColor,
        buttons: [
          { text: 'Annuler', style: 'cancel' },
          { text: confirmText, style: 'default', onPress: onConfirm },
        ],
      });
    },
    [showDialog]
  );

  const showDestructive = useCallback(
    ({
      title,
      message,
      confirmText = 'Confirmer',
      onConfirm,
    }: {
      title: string;
      message?: string;
      confirmText?: string;
      onConfirm: () => void;
    }) => {
      showDialog({
        title,
        message,
        accentColor: c.red,
        buttons: [
          { text: 'Annuler', style: 'cancel' },
          { text: confirmText, style: 'destructive', onPress: onConfirm },
        ],
      });
    },
    [showDialog]
  );

  return (
    <DialogContext.Provider value={{ showDialog, showConfirm, showDestructive, dismiss }}>
      {children}
      <AppDialog visible={visible} config={config} onDismiss={dismiss} />
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used within a DialogProvider');
  return ctx;
}
