'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Clock,
  Wrench,
  AlertTriangle,
  Calendar,
  User,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Package,
} from 'lucide-react';
import { MaintenanceRecord } from '@/types/maintenance';
import { useState } from 'react';

interface Props {
  records: MaintenanceRecord[];
}

const statusConfig = {
  SCHEDULED: {
    color: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    icon: Calendar,
    label: 'Scheduled',
  },
  IN_PROGRESS: {
    color: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
    icon: Wrench,
    label: 'In Progress',
  },
  COMPLETED: {
    color: 'bg-green-500/10 text-green-700 border-green-500/20',
    icon: CheckCircle2,
    label: 'Completed',
  },
  OVERDUE: {
    color: 'bg-red-500/10 text-red-700 border-red-500/20',
    icon: AlertTriangle,
    label: 'Overdue',
  },
  CANCELLED: {
    color: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
    icon: Clock,
    label: 'Cancelled',
  },
};

const typeConfig = {
  PREVENTIVE: { color: 'bg-blue-500', label: 'Preventive' },
  PREDICTIVE: { color: 'bg-purple-500', label: 'Predictive' },
  CORRECTIVE: { color: 'bg-orange-500', label: 'Corrective' },
  EMERGENCY: { color: 'bg-red-500', label: 'Emergency' },
};

export function MaintenanceTimeline({ records }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Maintenance History</h3>
          <p className="text-muted-foreground">
            No maintenance records found for this equipment
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Maintenance History ({records.length})</h3>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

        {/* Timeline Items */}
        <div className="space-y-6">
          {records.map((record, index) => {
            const statusInfo = statusConfig[record.status];
            const typeInfo = typeConfig[record.type];
            const StatusIcon = statusInfo.icon;
            const isExpanded = expandedIds.has(record.id);

            return (
              <div key={record.id} className="relative pl-14">
                {/* Timeline Dot */}
                <div
                  className={`absolute left-4 top-3 h-5 w-5 rounded-full ${typeInfo.color} border-4 border-background flex items-center justify-center`}
                >
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>

                {/* Card */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={typeInfo.color + ' text-white'}>
                            {typeInfo.label}
                          </Badge>
                          <Badge className={statusInfo.color + ' border'}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                          {record.priority === 'CRITICAL' && (
                            <Badge variant="destructive" className="animate-pulse">
                              CRITICAL
                            </Badge>
                          )}
                        </div>
                        <h4 className="text-lg font-semibold">{record.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {record.description}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(record.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Quick Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Scheduled</p>
                          <p className="font-medium">
                            {new Date(record.scheduledDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {record.technicianName && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Technician</p>
                            <p className="font-medium">{record.technicianName}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-xs text-muted-foreground">Total Cost</p>
                          <p className="font-bold text-green-600">${record.totalCost.toFixed(2)}</p>
                        </div>
                      </div>

                      {record.downtimeHours !== undefined && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <div>
                            <p className="text-xs text-muted-foreground">Downtime</p>
                            <p className="font-medium">{record.downtimeHours}h</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="space-y-4 pt-4 border-t">
                        {/* Actions Performed */}
                        {record.actions && record.actions.length > 0 && (
                          <div>
                            <h5 className="font-semibold mb-2">Actions Performed</h5>
                            <ul className="space-y-1">
                              {record.actions.map((action, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Parts Used */}
                        {record.partsUsed && record.partsUsed.length > 0 && (
                          <div>
                            <h5 className="font-semibold mb-2">Parts Used</h5>
                            <div className="space-y-2">
                              {record.partsUsed.map((part, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
                                >
                                  <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium">{part.partName}</span>
                                    <Badge variant="outline">Qty: {part.quantity}</Badge>
                                  </div>
                                  <span className="text-sm font-semibold">${part.cost.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Cost Breakdown */}
                        <div>
                          <h5 className="font-semibold mb-2">Cost Breakdown</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Labor</span>
                              <span className="font-medium">${record.laborCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Parts</span>
                              <span className="font-medium">${record.partsCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold border-t pt-2">
                              <span>Total</span>
                              <span className="text-green-600">${record.totalCost.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        {record.notes && (
                          <div>
                            <h5 className="font-semibold mb-2">Technician Notes</h5>
                            <p className="text-sm text-muted-foreground p-3 rounded-lg bg-gray-500/10 border border-gray-500/20">
                              {record.notes}
                            </p>
                          </div>
                        )}

                        {/* Next Maintenance */}
                        {record.nextMaintenanceDate && (
                          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-purple-600" />
                              <span className="text-sm font-semibold text-purple-700">
                                Next maintenance scheduled:{' '}
                                {new Date(record.nextMaintenanceDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}