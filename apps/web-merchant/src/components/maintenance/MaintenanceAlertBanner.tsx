import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { MaintenanceAlert } from '@/types/maintenance';
import { Badge } from '@/components/ui/badge';

interface Props {
  alert: MaintenanceAlert;
  onAcknowledge?: (alertId: string) => void;
  onViewDetails?: (alertId: string) => void;
}

export function MaintenanceAlertBanner({ alert, onAcknowledge, onViewDetails }: Props) {
  const severityConfig = {
    CRITICAL: {
      icon: AlertTriangle,
      bg: 'bg-red-500/10 border-red-500/30',
      iconColor: 'text-red-600',
      badge: 'bg-red-500',
    },
    WARNING: {
      icon: AlertTriangle,
      bg: 'bg-yellow-500/10 border-yellow-500/30',
      iconColor: 'text-yellow-600',
      badge: 'bg-yellow-500',
    },
    INFO: {
      icon: Info,
      bg: 'bg-blue-500/10 border-blue-500/30',
      iconColor: 'text-blue-600',
      badge: 'bg-blue-500',
    },
  };

  const config = severityConfig[alert.severity];
  const Icon = config.icon;

  if (alert.acknowledged) {
    return (
      <Alert className="bg-gray-500/10 border-gray-500/30">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-gray-600" />
          <div className="flex-1">
            <AlertDescription>
              <span className="font-semibold">{alert.equipmentName}:</span> {alert.message}
              <span className="text-xs text-muted-foreground ml-2">
                (Acknowledged by {alert.acknowledgedBy})
              </span>
            </AlertDescription>
          </div>
        </div>
      </Alert>
    );
  }

  return (
    <Alert className={config.bg + ' border-2'}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 ${config.iconColor} mt-0.5`} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={config.badge + ' text-white'}>
              {alert.severity}
            </Badge>
            <span className="font-semibold">{alert.equipmentName}</span>
          </div>
          <AlertDescription className="mb-2">
            {alert.message}
          </AlertDescription>
          <div className="text-sm text-muted-foreground mb-3">
            <span className="font-semibold">{alert.type.replace(/_/g, ' ')}:</span>{' '}
            {alert.reading} {alert.unit} (threshold: {alert.threshold} {alert.unit})
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onViewDetails?.(alert.id)}>
              View Details
            </Button>
            <Button size="sm" variant="outline" onClick={() => onAcknowledge?.(alert.id)}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Acknowledge
            </Button>
          </div>
        </div>
      </div>
    </Alert>
  );
}