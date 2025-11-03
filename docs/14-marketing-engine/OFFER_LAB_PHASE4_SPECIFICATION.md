# Offer-Lab Phase 4: Analytics Dashboard & Reporting

**Status**: 🚧 PLANNED (Not Yet Implemented)
**Estimated Timeline**: 2 weeks
**Dependencies**: Phase 1 ✅ Complete, Phase 2 ✅ Complete, Phase 3 🚧 Planned

---

## Overview

Phase 4 provides comprehensive analytics, reporting, and visualization capabilities for the entire Offer-Lab system. This phase delivers the marketing-admin frontend with real-time dashboards and actionable insights.

---

## Phase 4 Goals

1. **Real-Time Dashboard**: Live campaign performance monitoring
2. **Advanced Analytics**: Deep-dive into campaign, funnel, and offer performance
3. **Custom Reports**: Automated report generation and scheduling
4. **Data Visualization**: Charts, graphs, and heatmaps for all metrics
5. **Export Capabilities**: CSV, PDF, and API exports for all data
6. **Alert System**: Proactive notifications for important events

---

## Planned Features

### 4.1 Campaign Performance Dashboard

**Description**: Real-time overview of all campaign metrics

**Components**:
- Master dashboard with key metrics
- Campaign comparison table
- Performance trends (7-day, 30-day, all-time)
- Top performers / Bottom performers
- ROI calculator

**Key Metrics Displayed**:
- Total campaigns (active/paused/completed)
- Total spend vs. total revenue
- Overall ROI
- Total conversions
- Average CTR, EPC, CPA
- Traffic quality scores

**UI Components** (marketing-admin app):
- `CampaignDashboard.tsx`: Main dashboard
- `CampaignMetricsWidget.tsx`: Individual metric cards
- `CampaignComparisonTable.tsx`: Side-by-side comparison
- `PerformanceTrendChart.tsx`: Line charts for trends

---

### 4.2 Funnel Analytics Dashboard

**Description**: Detailed funnel performance and conversion tracking

**Components**:
- Funnel conversion rates
- Lead magnet download rates
- Drop-off analysis
- Time to conversion
- Lead quality scoring

**Visualizations**:
- Funnel visualization (step-by-step conversion)
- Heatmaps (click patterns)
- Scroll depth charts
- Device breakdown (desktop/mobile/tablet)
- GEO breakdown

**UI Components**:
- `FunnelAnalyticsDashboard.tsx`: Main funnel analytics
- `FunnelVisualization.tsx`: Conversion funnel chart
- `HeatmapViewer.tsx`: Click heatmap display
- `DeviceBreakdownChart.tsx`: Device distribution

---

### 4.3 Offer Intelligence Dashboard

**Description**: Comprehensive offer performance and scoring

**Components**:
- Offer leaderboard (sorted by EPC)
- Offer scoring breakdown
- Network comparison (MaxBounty vs ClickBank)
- Category performance
- Trending offers

**Metrics**:
- Total offers synced
- Active offers
- Top 10 offers by EPC
- Top 10 offers by conversion rate
- Offer score distribution

**UI Components**:
- `OfferDashboard.tsx`: Main offer dashboard
- `OfferLeaderboard.tsx`: Top performing offers
- `OfferScoringBreakdown.tsx`: Score visualization
- `NetworkComparisonChart.tsx`: Network performance

---

### 4.4 Traffic Source Analytics

**Description**: Traffic network performance and quality tracking

**Components**:
- Network comparison (PopAds vs PropellerAds)
- GEO performance breakdown
- Device performance breakdown
- Traffic quality trends
- Blacklist/Whitelist management

**Metrics**:
- Cost per network
- Conversions per network
- ROI per network
- Quality score per network
- Fraud detection alerts

**UI Components**:
- `TrafficDashboard.tsx`: Main traffic analytics
- `NetworkComparisonChart.tsx`: Network vs network
- `GeoPerformanceMap.tsx`: World map with performance
- `TrafficQualityTrend.tsx`: Quality score over time

---

### 4.5 A/B Test Dashboard (Phase 3 Integration)

**Description**: A/B test results and winner detection

**Components**:
- Active tests overview
- Test results with statistical significance
- Winner promotion interface
- Historical test archive

**Metrics**:
- Tests running / completed
- Winning variant lift (%)
- Statistical confidence
- Revenue impact

**UI Components**:
- `ABTestDashboard.tsx`: Main A/B test dashboard
- `TestResultsCard.tsx`: Individual test results
- `WinnerPromotionDialog.tsx`: Promote winner UI
- `StatisticalSignificanceChart.tsx`: Confidence visualization

---

### 4.6 Financial Dashboard

**Description**: Revenue, spend, and ROI tracking

**Components**:
- Profit/loss statements
- Budget utilization
- Cost breakdown (by network, campaign, GEO)
- Revenue breakdown (by offer, funnel, campaign)
- Forecasting (predicted spend/revenue)

**Metrics**:
- Total spend
- Total revenue
- Net profit
- ROI
- Budget remaining
- Projected monthly spend
- Projected monthly revenue

**UI Components**:
- `FinancialDashboard.tsx`: Main financial overview
- `ProfitLossChart.tsx`: P&L visualization
- `BudgetUtilizationWidget.tsx`: Budget gauge
- `RevenueBreakdownChart.tsx`: Revenue sources

---

### 4.7 Custom Report Builder

**Description**: Create and schedule custom reports

**Components**:
- Report template library
- Custom metric selection
- Date range picker
- Automated report scheduling
- Email delivery

**Report Types**:
1. **Daily Performance Report**: Yesterday's metrics
2. **Weekly Performance Report**: Last 7 days summary
3. **Monthly Performance Report**: Monthly overview
4. **Campaign Deep-Dive Report**: Single campaign analysis
5. **Offer Performance Report**: Offer-level metrics
6. **Executive Summary Report**: High-level KPIs

**Export Formats**:
- PDF (with charts and tables)
- CSV (raw data)
- Excel (formatted)
- JSON (API export)

**UI Components**:
- `ReportBuilder.tsx`: Custom report creator
- `ReportScheduler.tsx`: Schedule automated reports
- `ReportPreview.tsx`: Preview before export
- `ReportTemplateLibrary.tsx`: Pre-built templates

---

### 4.8 Alert & Notification Center

**Description**: Proactive alerts for critical events

**Alert Types**:
1. **Budget Alerts**: Daily budget 80% exhausted, global cap approaching
2. **Performance Alerts**: ROI drops below 0%, CTR drops below 0.3%
3. **Campaign Alerts**: Campaign auto-paused, campaign scaled
4. **Traffic Alerts**: Fraud detected, traffic quality drops below 50
5. **A/B Test Alerts**: Test reached significance, winner detected
6. **Conversion Alerts**: No conversions in 24 hours on active campaign

**Notification Channels**:
- In-app notifications
- Email notifications
- Slack webhooks (optional)
- SMS notifications (optional)

**UI Components**:
- `NotificationCenter.tsx`: Notification inbox
- `AlertConfigurationPanel.tsx`: Configure alert thresholds
- `NotificationSettings.tsx`: Channel preferences

---

## API Endpoints

### Analytics Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/analytics/dashboard` | GET | Get dashboard overview |
| `/analytics/campaigns` | GET | Campaign analytics |
| `/analytics/funnels` | GET | Funnel analytics |
| `/analytics/offers` | GET | Offer performance |
| `/analytics/traffic` | GET | Traffic source analytics |
| `/analytics/financial` | GET | Financial metrics |
| `/analytics/ab-tests` | GET | A/B test results |

### Reporting Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/reports/templates` | GET | List report templates |
| `/reports/custom` | POST | Create custom report |
| `/reports/:id` | GET | Get report by ID |
| `/reports/:id/export` | GET | Export report (PDF/CSV/Excel) |
| `/reports/schedule` | POST | Schedule automated report |
| `/reports/scheduled` | GET | List scheduled reports |

### Alert Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/alerts` | GET | Get all alerts |
| `/alerts/unread` | GET | Get unread alerts |
| `/alerts/:id/mark-read` | PATCH | Mark alert as read |
| `/alerts/settings` | GET | Get alert settings |
| `/alerts/settings` | PUT | Update alert settings |

**Total New Endpoints**: 17

---

## Frontend Implementation (marketing-admin)

### New Pages

1. **Dashboard** (`/app/offer-lab/dashboard/page.tsx`)
   - Overview of all campaigns, funnels, offers
   - Key metrics cards
   - Performance trends

2. **Campaigns** (`/app/offer-lab/campaigns/page.tsx`)
   - Campaign list with filters
   - Campaign details modal
   - Launch campaign wizard

3. **Funnels** (`/app/offer-lab/funnels/page.tsx`)
   - Funnel list
   - Funnel analytics
   - Funnel builder (integration with Phase 1)

4. **Offers** (`/app/offer-lab/offers/page.tsx`)
   - Offer leaderboard
   - Offer sync status
   - Offer activation

5. **Traffic** (`/app/offer-lab/traffic/page.tsx`)
   - Traffic connections
   - Network performance
   - Traffic quality scores

6. **Analytics** (`/app/offer-lab/analytics/page.tsx`)
   - Deep-dive analytics
   - Custom date ranges
   - Metric comparisons

7. **Reports** (`/app/offer-lab/reports/page.tsx`)
   - Report templates
   - Custom report builder
   - Scheduled reports

8. **Settings** (`/app/offer-lab/settings/page.tsx`)
   - Alert configuration
   - Notification preferences
   - API integrations

---

## Component Library

### Chart Components (using Recharts)

- `LineChart.tsx`: Line chart for trends
- `BarChart.tsx`: Bar chart for comparisons
- `PieChart.tsx`: Pie chart for distributions
- `AreaChart.tsx`: Area chart for cumulative metrics
- `ComposedChart.tsx`: Multi-metric charts
- `Heatmap.tsx`: Click heatmaps
- `GeoMap.tsx`: World map with performance data

### Data Display Components

- `MetricCard.tsx`: KPI cards with trend indicators
- `DataTable.tsx`: Sortable, filterable tables
- `StatWidget.tsx`: Single stat display
- `ProgressBar.tsx`: Budget utilization, test progress
- `Badge.tsx`: Status badges (active/paused/completed)

### Interactive Components

- `DateRangePicker.tsx`: Custom date ranges
- `FilterPanel.tsx`: Advanced filtering
- `ExportMenu.tsx`: Export options dropdown
- `RefreshButton.tsx`: Manual data refresh

---

## Database Schema Extensions

```prisma
// Custom reports
model Report {
  id            String   @id @default(cuid())
  name          String
  description   String?
  reportType    String   // 'daily' | 'weekly' | 'monthly' | 'custom'
  metrics       String[] // Array of metric IDs
  filters       Json     // Filters applied
  isScheduled   Boolean  @default(false)
  schedule      String?  // Cron expression
  lastRunAt     DateTime?
  nextRunAt     DateTime?
  createdBy     String   // User ID
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  exports       ReportExport[]
}

// Report exports
model ReportExport {
  id            String   @id @default(cuid())
  reportId      String
  report        Report   @relation(fields: [reportId], references: [id])
  format        String   // 'pdf' | 'csv' | 'excel' | 'json'
  fileUrl       String   // S3 URL or local path
  fileSize      Int      // Bytes
  generatedAt   DateTime @default(now())

  @@index([reportId])
}

// Alert configuration
model AlertConfiguration {
  id            String   @id @default(cuid())
  alertType     String   // 'budget' | 'performance' | 'campaign' | 'traffic' | 'ab-test' | 'conversion'
  isEnabled     Boolean  @default(true)
  threshold     Json     // Alert-specific thresholds
  channels      String[] // 'in-app' | 'email' | 'slack' | 'sms'
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  notifications AlertNotification[]
}

// Alert notifications
model AlertNotification {
  id            String   @id @default(cuid())
  configId      String
  config        AlertConfiguration @relation(fields: [configId], references: [id])
  campaignId    String?  // If campaign-related
  funnelId      String?  // If funnel-related
  severity      String   // 'low' | 'medium' | 'high' | 'critical'
  message       String
  isRead        Boolean  @default(false)
  readAt        DateTime?
  createdAt     DateTime @default(now())

  @@index([configId])
  @@index([isRead])
}
```

---

## Success Metrics

Phase 4 will be considered successful when:

1. ✅ Dashboard loads in < 2 seconds with real-time data
2. ✅ All analytics pages are fully functional and accurate
3. ✅ Custom reports can be generated and exported in all formats
4. ✅ Alerts fire correctly and notifications are delivered
5. ✅ Frontend provides intuitive UX for all Offer-Lab features
6. ✅ Users can manage entire Offer-Lab workflow from dashboard

---

## Implementation Timeline

**Week 1**: Backend API endpoints + Dashboard/Campaign pages
**Week 2**: Analytics/Reports pages + Alert system + Polish

---

## Dependencies

**Required from Phase 1**:
- Offer data
- Funnel data
- Lead data

**Required from Phase 2**:
- Campaign data
- Metrics data
- Traffic connection data

**Required from Phase 3**:
- A/B test data
- Traffic quality scores
- Scaling events

**Frontend Stack**:
- Next.js 14 (already set up)
- Recharts (data visualization)
- shadcn/ui (component library)
- TanStack Query (data fetching)
- Zustand (state management)

---

## Related Documentation

- [Phase 1 Audit](/docs/15-validations/HALLUCINATION_AUDITS/OFFER_LAB_PHASE1_AUDIT.md) ✅
- [Phase 2 Audit](/docs/15-validations/HALLUCINATION_AUDITS/OFFER_LAB_PHASE2_AUDIT.md) ✅
- [Phase 3 Specification](/docs/14-marketing-engine/OFFER_LAB_PHASE3_SPECIFICATION.md) 🚧
- [Phase 4 Audit](/docs/15-validations/HALLUCINATION_AUDITS/OFFER_LAB_PHASE4_AUDIT.md) 🚧
- [Use-Case Diagram](/docs/14-marketing-engine/OFFER_LAB_USE_CASE_DIAGRAM.md)

---

**Status**: 🚧 Specification Complete - Ready for Implementation
