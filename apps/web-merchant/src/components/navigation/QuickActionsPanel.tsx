'use client';

// TODO: Install @radix-ui/react-dialog

interface QuickActionsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickActionsPanel({ open, onOpenChange }: QuickActionsPanelProps) {
  return null;
}

export function useQuickActionsPanel() {
  return {
    open: false,
    setOpen: (val: boolean) => {},
    toggle: () => {}
  };
}
