'use client';

import { useState } from 'react';
// TODO: Install dialog component from shadcn/ui
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Activity,
  AlertTriangle,
  Calendar,
  Package,
  Wrench,
  X,
  TrendingUp,
  Zap,
  Droplets,
  Thermometer,
  Clock,
} from 'lucide-react';

interface Props {
  equipmentId: string;
  equipmentName: string;
  open: boolean;
  onClose: () => void;
}

// TODO: Re-enable when Dialog component is installed
export function MaintenanceModal({ equipmentId, equipmentName, open, onClose }: Props) {
  return (
    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div>
          <h3 className="font-semibold text-yellow-900">Maintenance Modal Disabled</h3>
          <p className="text-sm text-yellow-800 mt-1">
            The maintenance modal component requires the Dialog UI component to be installed.
            This will be re-enabled in a future update once dependencies are installed.
          </p>
        </div>
      </div>
    </div>
  );
}
