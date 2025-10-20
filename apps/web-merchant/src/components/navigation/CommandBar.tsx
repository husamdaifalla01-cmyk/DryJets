'use client';

import * as React from 'react';

interface CommandBarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// TODO: Re-enable when radix-ui/react-dialog is installed
export function CommandBar({ open, onOpenChange }: CommandBarProps) {
  return null;
}

export function useCommandBar() {
  return {
    open: false,
    setOpen: (val: boolean) => {},
    toggle: () => {}
  };
}
