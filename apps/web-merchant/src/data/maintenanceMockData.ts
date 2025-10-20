// Mock Maintenance Data for DryJets Platform

import {
  MaintenanceRecord,
  MaintenanceAlert,
  MaintenancePart,
  TelemetryReading,
  TechnicianAssignment,
  MaintenancePrediction,
} from '@/types/maintenance';

// Mock Telemetry Data (Recent readings for 3 washers and 2 dryers)
export const mockTelemetryData: Record<string, TelemetryReading[]> = {
  'washer-1': [
    {
      timestamp: new Date('2025-10-19T14:30:00'),
      powerUsage: 3.8,
      waterUsage: 52,
      temperature: 58,
      vibration: 3.8, // ALERT: Above threshold of 3.5
      cycleCount: 247,
      efficiency: 89,
    },
    {
      timestamp: new Date('2025-10-19T13:30:00'),
      powerUsage: 3.5,
      waterUsage: 50,
      temperature: 55,
      vibration: 3.6,
      cycleCount: 246,
      efficiency: 91,
    },
  ],
  'washer-2': [
    {
      timestamp: new Date('2025-10-19T14:30:00'),
      powerUsage: 3.2,
      waterUsage: 48,
      temperature: 54,
      vibration: 2.8,
      cycleCount: 189,
      efficiency: 94,
    },
  ],
  'washer-3': [
    {
      timestamp: new Date('2025-10-19T14:30:00'),
      powerUsage: 3.4,
      waterUsage: 51,
      temperature: 66, // ALERT: Above threshold of 65°C
      vibration: 3.0,
      cycleCount: 312,
      efficiency: 87,
    },
  ],
  'dryer-1': [
    {
      timestamp: new Date('2025-10-19T14:30:00'),
      powerUsage: 4.2,
      waterUsage: 0,
      temperature: 72,
      vibration: 2.1,
      cycleCount: 198,
      efficiency: 92,
    },
  ],
  'dryer-2': [
    {
      timestamp: new Date('2025-10-19T14:30:00'),
      powerUsage: 4.8, // ALERT: Above threshold of 4.5kW
      waterUsage: 0,
      temperature: 75,
      vibration: 2.5,
      cycleCount: 156,
      efficiency: 85,
    },
  ],
};

// Mock Active Alerts
export const mockAlerts: MaintenanceAlert[] = [
  {
    id: 'alert-1',
    equipmentId: 'washer-1',
    equipmentName: 'Washer #1',
    severity: 'CRITICAL',
    type: 'HIGH_VIBRATION',
    message: 'Abnormal vibration detected - possible drum imbalance or bearing wear',
    reading: 3.8,
    threshold: 3.5,
    unit: 'G-force',
    detectedAt: new Date('2025-10-19T14:30:00'),
    acknowledged: false,
  },
  {
    id: 'alert-2',
    equipmentId: 'washer-3',
    equipmentName: 'Washer #3',
    severity: 'WARNING',
    type: 'OVERHEATING',
    message: 'Temperature exceeding normal operating range',
    reading: 66,
    threshold: 65,
    unit: '°C',
    detectedAt: new Date('2025-10-19T14:25:00'),
    acknowledged: true,
    acknowledgedBy: 'Sarah Chen',
    acknowledgedAt: new Date('2025-10-19T14:35:00'),
  },
  {
    id: 'alert-3',
    equipmentId: 'dryer-2',
    equipmentName: 'Dryer #2',
    severity: 'WARNING',
    type: 'POWER_SPIKE',
    message: 'Higher than expected power consumption detected',
    reading: 4.8,
    threshold: 4.5,
    unit: 'kW',
    detectedAt: new Date('2025-10-19T13:45:00'),
    acknowledged: true,
    acknowledgedBy: 'Sarah Chen',
    acknowledgedAt: new Date('2025-10-19T14:00:00'),
  },
];

// Mock Maintenance Parts Inventory
export const mockParts: MaintenancePart[] = [
  {
    id: 'part-1',
    sku: 'BELT-W-001',
    name: 'Drive Belt - Heavy Duty',
    description: 'Replacement drive belt for commercial washers',
    compatibleModels: ['Washer Model X100', 'Washer Model X200'],
    price: 45.99,
    inStock: true,
    quantity: 8,
    estimatedDeliveryDays: 1,
    supplier: 'Industrial Parts Co.',
  },
  {
    id: 'part-2',
    sku: 'BEARING-W-002',
    name: 'Drum Bearing Assembly',
    description: 'Complete bearing assembly for washer drum',
    compatibleModels: ['Washer Model X100', 'Washer Model X200', 'Washer Model X300'],
    price: 129.99,
    inStock: true,
    quantity: 4,
    estimatedDeliveryDays: 1,
    supplier: 'Industrial Parts Co.',
  },
  {
    id: 'part-3',
    sku: 'ELEMENT-D-001',
    name: 'Heating Element',
    description: 'Commercial grade heating element for dryers',
    compatibleModels: ['Dryer Model D500', 'Dryer Model D600'],
    price: 89.99,
    inStock: true,
    quantity: 3,
    estimatedDeliveryDays: 2,
    supplier: 'Appliance Wholesale',
  },
  {
    id: 'part-4',
    sku: 'THERMOSTAT-D-002',
    name: 'High-Limit Thermostat',
    description: 'Safety thermostat for dryer temperature control',
    compatibleModels: ['Dryer Model D500', 'Dryer Model D600', 'Dryer Model D700'],
    price: 34.99,
    inStock: true,
    quantity: 12,
    estimatedDeliveryDays: 1,
    supplier: 'Appliance Wholesale',
  },
  {
    id: 'part-5',
    sku: 'MOTOR-W-003',
    name: 'Wash Motor Assembly',
    description: '1.5HP motor for commercial washers',
    compatibleModels: ['Washer Model X100'],
    price: 325.00,
    inStock: false,
    quantity: 0,
    estimatedDeliveryDays: 7,
    supplier: 'Motor Solutions Inc.',
  },
  {
    id: 'part-6',
    sku: 'FILTER-W-004',
    name: 'Lint Filter Replacement',
    description: 'High-efficiency lint trap filter',
    compatibleModels: ['Washer Model X100', 'Washer Model X200', 'Washer Model X300'],
    price: 15.99,
    inStock: true,
    quantity: 24,
    estimatedDeliveryDays: 1,
    supplier: 'Industrial Parts Co.',
  },
];

// Mock Technicians
export const mockTechnicians: TechnicianAssignment[] = [
  {
    id: 'tech-1',
    name: 'Mike Rodriguez',
    email: 'mike.rodriguez@dryjets.com',
    phone: '+1 (555) 123-4567',
    specialty: ['WASHER', 'DRYER', 'ELECTRICAL'],
    activeJobs: 2,
    completedJobs: 127,
    avgResolutionTime: 2.3,
    rating: 4.8,
    availability: 'BUSY',
  },
  {
    id: 'tech-2',
    name: 'Lisa Chen',
    email: 'lisa.chen@dryjets.com',
    phone: '+1 (555) 234-5678',
    specialty: ['WASHER', 'PRESS', 'MECHANICAL'],
    activeJobs: 1,
    completedJobs: 98,
    avgResolutionTime: 1.8,
    rating: 4.9,
    availability: 'AVAILABLE',
  },
  {
    id: 'tech-3',
    name: 'James Wilson',
    email: 'james.wilson@dryjets.com',
    phone: '+1 (555) 345-6789',
    specialty: ['DRYER', 'ELECTRICAL', 'HVAC'],
    activeJobs: 0,
    completedJobs: 156,
    avgResolutionTime: 2.1,
    rating: 4.7,
    availability: 'AVAILABLE',
  },
];

// Mock Maintenance Records
export const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: 'maint-1',
    equipmentId: 'washer-1',
    equipmentName: 'Washer #1',
    equipmentType: 'WASHER',
    type: 'CORRECTIVE',
    status: 'COMPLETED',
    priority: 'HIGH',

    scheduledDate: new Date('2025-10-19T09:00:00'),
    startedAt: new Date('2025-10-19T09:15:00'),
    completedAt: new Date('2025-10-19T11:45:00'),
    downtimeHours: 2.5,

    assignedTo: 'tech-1',
    technicianName: 'Mike Rodriguez',
    assignedBy: 'Sarah Chen',
    assignedAt: new Date('2025-10-18T16:30:00'),

    title: 'Replace Drive Belt & Inspect Bearings',
    description: 'Customer reported unusual noise during spin cycle. Scheduled immediate inspection and repair.',
    notes: 'Found worn drive belt and early signs of bearing wear. Replaced belt, lubricated bearings. Recommended bearing replacement in next 2-3 months.',
    actions: [
      'Inspected drum assembly and belt system',
      'Replaced drive belt (BELT-W-001)',
      'Lubricated drum bearings',
      'Tested spin cycle - noise eliminated',
      'Performed calibration and safety checks',
    ],
    partsUsed: [
      {
        partId: 'part-1',
        partName: 'Drive Belt - Heavy Duty',
        quantity: 1,
        cost: 45.99,
      },
    ],

    laborCost: 120.00,
    partsCost: 45.99,
    totalCost: 165.99,

    photos: ['/maintenance/washer-1-belt-before.jpg', '/maintenance/washer-1-belt-after.jpg'],

    issuesFound: ['Worn drive belt', 'Minor bearing wear', 'Lint buildup in filter'],
    nextMaintenanceDate: new Date('2025-12-19T09:00:00'),

    createdAt: new Date('2025-10-18T16:30:00'),
    updatedAt: new Date('2025-10-19T11:45:00'),
  },
  {
    id: 'maint-2',
    equipmentId: 'washer-1',
    equipmentName: 'Washer #1',
    equipmentType: 'WASHER',
    type: 'CORRECTIVE',
    status: 'IN_PROGRESS',
    priority: 'CRITICAL',

    scheduledDate: new Date('2025-10-19T15:00:00'),
    startedAt: new Date('2025-10-19T15:10:00'),

    assignedTo: 'tech-1',
    technicianName: 'Mike Rodriguez',
    assignedBy: 'System Auto-Assign',
    assignedAt: new Date('2025-10-19T14:35:00'),

    title: 'Investigate High Vibration Alert',
    description: 'IoT sensors detected abnormal vibration levels (3.8 G-force, threshold: 3.5). Possible drum imbalance or bearing failure.',
    notes: 'Technician en route. ETA 10 minutes.',

    laborCost: 0,
    partsCost: 0,
    totalCost: 0,

    createdAt: new Date('2025-10-19T14:30:00'),
    updatedAt: new Date('2025-10-19T15:10:00'),
  },
  {
    id: 'maint-3',
    equipmentId: 'dryer-1',
    equipmentName: 'Dryer #1',
    equipmentType: 'DRYER',
    type: 'PREVENTIVE',
    status: 'SCHEDULED',
    priority: 'MEDIUM',

    scheduledDate: new Date('2025-10-22T10:00:00'),

    assignedTo: 'tech-3',
    technicianName: 'James Wilson',
    assignedBy: 'Sarah Chen',
    assignedAt: new Date('2025-10-18T14:00:00'),

    title: 'Quarterly Preventive Maintenance',
    description: 'Scheduled quarterly inspection and maintenance as per manufacturer recommendations.',
    actions: [
      'Clean lint traps and exhaust system',
      'Inspect heating element and thermostat',
      'Check belt tension and drum alignment',
      'Lubricate moving parts',
      'Test all safety sensors',
    ],

    laborCost: 80.00,
    partsCost: 0,
    totalCost: 80.00,

    createdAt: new Date('2025-10-18T14:00:00'),
    updatedAt: new Date('2025-10-18T14:00:00'),
  },
  {
    id: 'maint-4',
    equipmentId: 'washer-3',
    equipmentName: 'Washer #3',
    equipmentType: 'WASHER',
    type: 'PREDICTIVE',
    status: 'SCHEDULED',
    priority: 'MEDIUM',

    scheduledDate: new Date('2025-10-25T13:00:00'),
    predictedDate: new Date('2025-11-03T00:00:00'),
    predictionConfidence: 87,

    assignedTo: 'tech-2',
    technicianName: 'Lisa Chen',
    assignedBy: 'ML Prediction System',
    assignedAt: new Date('2025-10-19T08:00:00'),

    title: 'Predictive Maintenance - Bearing Replacement',
    description: 'ML model predicts bearing failure within 2 weeks based on vibration patterns and cycle count. Scheduling proactive replacement.',
    notes: 'Current health score: 72%. Recommend replacement before predicted failure date.',

    laborCost: 150.00,
    partsCost: 129.99,
    totalCost: 279.99,

    createdAt: new Date('2025-10-19T08:00:00'),
    updatedAt: new Date('2025-10-19T08:00:00'),
  },
  {
    id: 'maint-5',
    equipmentId: 'dryer-2',
    equipmentName: 'Dryer #2',
    equipmentType: 'DRYER',
    type: 'PREVENTIVE',
    status: 'OVERDUE',
    priority: 'HIGH',

    scheduledDate: new Date('2025-10-15T14:00:00'),

    title: 'Overdue: Monthly Filter & Vent Cleaning',
    description: 'Monthly maintenance window missed. Requires immediate attention to prevent efficiency loss.',

    laborCost: 60.00,
    partsCost: 15.99,
    totalCost: 75.99,

    createdAt: new Date('2025-10-10T10:00:00'),
    updatedAt: new Date('2025-10-10T10:00:00'),
  },
];

// Mock ML Predictions
export const mockPredictions: MaintenancePrediction[] = [
  {
    equipmentId: 'washer-3',
    predictedFailureDate: new Date('2025-11-03T00:00:00'),
    confidence: 87,
    riskFactors: [
      {
        factor: 'Bearing Wear Pattern',
        impact: 78,
        trend: 'INCREASING',
      },
      {
        factor: 'Vibration Trend',
        impact: 65,
        trend: 'INCREASING',
      },
      {
        factor: 'Cycle Count vs. Expected Lifespan',
        impact: 55,
        trend: 'STABLE',
      },
      {
        factor: 'Temperature Fluctuation',
        impact: 42,
        trend: 'STABLE',
      },
    ],
    recommendedActions: [
      'Schedule bearing replacement within 2 weeks',
      'Reduce load capacity by 15% until maintenance',
      'Monitor vibration levels every 6 hours',
      'Have replacement parts on-site before maintenance',
    ],
  },
  {
    equipmentId: 'dryer-2',
    predictedFailureDate: new Date('2025-11-15T00:00:00'),
    confidence: 72,
    riskFactors: [
      {
        factor: 'Heating Element Degradation',
        impact: 68,
        trend: 'INCREASING',
      },
      {
        factor: 'Power Consumption Increase',
        impact: 61,
        trend: 'INCREASING',
      },
      {
        factor: 'Temperature Regulation Variance',
        impact: 48,
        trend: 'STABLE',
      },
    ],
    recommendedActions: [
      'Inspect heating element for signs of failure',
      'Test thermostat calibration',
      'Consider scheduling replacement during next slow period',
    ],
  },
];

// Helper function to get equipment with maintenance data
export const getEquipmentWithMaintenance = (equipmentId: string) => {
  const alerts = mockAlerts.filter(alert => alert.equipmentId === equipmentId);
  const maintenanceRecords = mockMaintenanceRecords.filter(m => m.equipmentId === equipmentId);
  const latestTelemetry = mockTelemetryData[equipmentId]?.[0];
  const prediction = mockPredictions.find(p => p.equipmentId === equipmentId);

  const inProgressMaintenance = maintenanceRecords.find(m => m.status === 'IN_PROGRESS');

  return {
    activeAlerts: alerts.filter(a => !a.acknowledged),
    allAlerts: alerts,
    maintenanceRecords: maintenanceRecords.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    latestTelemetry,
    prediction,
    maintenanceRequired: alerts.some(a => a.severity === 'CRITICAL' && !a.acknowledged),
    isAvailable: !inProgressMaintenance,
    currentDowntime: inProgressMaintenance ? {
      startedAt: inProgressMaintenance.startedAt!,
      reason: inProgressMaintenance.title,
      estimatedEndAt: new Date(inProgressMaintenance.startedAt!.getTime() + 2 * 60 * 60 * 1000), // +2 hours
    } : undefined,
  };
};