// Maintenance Management Types for DryJets Platform

export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';

export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type MaintenanceType = 'PREVENTIVE' | 'PREDICTIVE' | 'CORRECTIVE' | 'EMERGENCY';

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface TelemetryReading {
  timestamp: Date;
  powerUsage: number; // kW
  waterUsage: number; // L
  temperature: number; // °C
  vibration: number; // G-force
  cycleCount: number;
  efficiency: number; // %
}

export interface TelemetryThresholds {
  powerUsageMax: number;
  waterUsageMax: number;
  temperatureMax: number;
  vibrationMax: number;
}

export interface MaintenanceAlert {
  id: string;
  equipmentId: string;
  equipmentName: string;
  severity: AlertSeverity;
  type: string; // e.g., "HIGH_VIBRATION", "OVERHEATING", "POWER_SPIKE"
  message: string;
  reading: number;
  threshold: number;
  unit: string;
  detectedAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface MaintenancePart {
  id: string;
  sku: string;
  name: string;
  description: string;
  compatibleModels: string[];
  price: number;
  inStock: boolean;
  quantity: number;
  estimatedDeliveryDays: number;
  supplier: string;
  imageUrl?: string;
}

export interface PartUsage {
  partId: string;
  partName: string;
  quantity: number;
  cost: number;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentType: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  priority: MaintenancePriority;

  // Scheduling
  scheduledDate: Date;
  predictedDate?: Date;
  predictionConfidence?: number; // 0-100%

  // Assignment
  assignedTo?: string; // Technician ID
  technicianName?: string;
  assignedBy?: string;
  assignedAt?: Date;

  // Execution
  startedAt?: Date;
  completedAt?: Date;
  downtimeHours?: number;

  // Details
  title: string;
  description: string;
  notes?: string;
  actions?: string[]; // Actions performed
  partsUsed?: PartUsage[];

  // Costs
  laborCost: number;
  partsCost: number;
  totalCost: number;

  // Attachments
  photos?: string[];
  documents?: string[];

  // Metrics
  issuesFound?: string[];
  nextMaintenanceDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenancePrediction {
  equipmentId: string;
  predictedFailureDate: Date;
  confidence: number; // 0-100%
  riskFactors: {
    factor: string;
    impact: number; // 0-100%
    trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  }[];
  recommendedActions: string[];
}

export interface MaintenanceSchedule {
  equipmentId: string;
  equipmentName: string;
  lastMaintenance?: Date;
  nextMaintenance: Date;
  frequency: number; // days
  isPredictive: boolean;
  confidence?: number;
}

export interface MaintenanceCostSummary {
  period: string;
  totalCost: number;
  laborCost: number;
  partsCost: number;
  downtimeHours: number;
  maintenanceCount: number;
  costPerMaintenance: number;
  costPerDowntimeHour: number;
}

export interface EquipmentWithMaintenance {
  id: string;
  name: string;
  type: string;
  status: string;
  isIotEnabled: boolean;

  // Telemetry
  latestTelemetry?: TelemetryReading;
  telemetryThresholds: TelemetryThresholds;

  // Health & Maintenance
  healthScore?: number;
  maintenanceRequired: boolean;
  activeAlerts: MaintenanceAlert[];
  upcomingMaintenance?: MaintenanceSchedule;
  lastMaintenance?: Date;

  // Operational
  isAvailable: boolean; // false if in maintenance
  currentDowntime?: {
    startedAt: Date;
    reason: string;
    estimatedEndAt?: Date;
  };
}

export interface MaintenanceDashboardStats {
  activeIssues: number;
  scheduledMaintenance: number;
  overdueMaintenance: number;
  totalDowntimeHours: number;
  monthlyCost: number;
  avgDowntimePerMachine: number;
  predictiveMaintenanceSavings: number;
}

export interface TechnicianAssignment {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string[];
  activeJobs: number;
  completedJobs: number;
  avgResolutionTime: number; // hours
  rating: number;
  availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
}