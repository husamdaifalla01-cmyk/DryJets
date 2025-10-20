'use client';

import { ControlCenterLayout } from '@/components/layout/ControlCenterLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ControlCenterLayout>
      {children}
    </ControlCenterLayout>
  );
}
