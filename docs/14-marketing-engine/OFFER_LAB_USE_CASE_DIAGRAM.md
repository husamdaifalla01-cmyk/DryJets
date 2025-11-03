# Offer-Lab Use-Case Diagram

## Rendering Instructions

To generate the SVG from the PlantUML source:

```bash
# Install PlantUML (macOS)
brew install plantuml

# Generate SVG
plantuml -tsvg docs/14-marketing-engine/OFFER_LAB_USE_CASE_DIAGRAM.puml

# Or use online renderer
# https://www.plantuml.com/plantuml/uml/
```

## Diagram Overview

The use-case diagram depicts the complete Offer-Lab system across Phases 1 & 2:

### Actors
- **Admin User**: Primary system operator
- **Affiliate Network Adapters**: MaxBounty (scraper), ClickBank (API)
- **Traffic Network Adapters**: PopAds, PropellerAds
- **Database**: PostgreSQL with Prisma ORM
- **Analytics Engine**: Performance calculation and auto-pause logic

### Phase 1: Intelligence & Funnels (14 endpoints)
- Connect affiliate networks with encrypted credentials
- Sync and score offers automatically
- Generate AI-powered landing funnels (AIDA framework)
- Create PDF lead magnets with Puppeteer
- Capture and manage leads

### Phase 2: Traffic & Optimization (6 endpoints)
- Create traffic network connections
- Launch micro-budget test campaigns ($5+ daily)
- Generate 5 ad variants per campaign (pain/benefit/urgency/social-proof/scarcity)
- Auto-sync metrics every 6 hours
- Auto-pause underperforming campaigns every 30 minutes
- Track conversions via postback URLs

### Key Relationships
- **Include**: Mandatory sub-use-cases (e.g., Launch Campaign → Generate Ad Variants)
- **Extend**: Optional extensions (e.g., Auto-Pause Rules → Pause Campaign)
- **Dependencies**: Cross-phase links (e.g., Launch Campaign requires Funnel + Activated Offer)

### Automated Jobs
1. **Offer Sync Processor**: Runs every 3 days at 2 AM
2. **Ad Metrics Sync Processor**: Runs every 6 hours
3. **Auto-Pause Checker Processor**: Runs every 30 minutes

### Auto-Pause Rules
- CTR < 0.4% after 500 impressions
- No conversions after $50 spent
- Budget exhaustion at 95%
- Low EPC < $0.01
- Negative ROI < -50%

## Source File
[OFFER_LAB_USE_CASE_DIAGRAM.puml](./OFFER_LAB_USE_CASE_DIAGRAM.puml)

## Related Documentation
- [Marketing Engine API Documentation](./MARKETING_ENGINE_API_DOCUMENTATION.md)
- [Phase 1 Audit](../15-validations/HALLUCINATION_AUDITS/OFFER_LAB_PHASE1_AUDIT.md)
- [Phase 2 Audit](../15-validations/HALLUCINATION_AUDITS/OFFER_LAB_PHASE2_AUDIT.md)
- [Phase 2 Verification](../15-validations/OFFER_LAB_PHASE2_AUDIT.md)
