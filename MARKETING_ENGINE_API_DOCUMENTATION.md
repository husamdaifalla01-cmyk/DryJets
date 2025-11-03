# Marketing Workflow Engine - Complete API Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Quick Start](#quick-start)
4. [API Reference](#api-reference)
   - [Authentication APIs](#authentication-apis)
   - [Profile Management APIs](#profile-management-apis)
   - [Campaign Management APIs](#campaign-management-apis)
   - [Content Creation APIs](#content-creation-apis)
   - [Trend Intelligence APIs](#trend-intelligence-apis)
   - [SEO Automation APIs](#seo-automation-apis)
   - [Video Studio APIs](#video-studio-apis)
   - [Publishing & Distribution APIs](#publishing--distribution-apis)
   - [Analytics & Reporting APIs](#analytics--reporting-apis)
   - [Intelligence Dashboard APIs](#intelligence-dashboard-apis)
   - [ML Lab APIs](#ml-lab-apis)
   - [Workflows APIs](#workflows-apis)
   - [Optimization Center APIs](#optimization-center-apis)
   - [Monitoring & Health APIs](#monitoring--health-apis)
   - [Offer-Lab APIs](#offer-lab-apis)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Webhooks](#webhooks)
8. [SDK Usage Examples](#sdk-usage-examples)
9. [Integration Guides](#integration-guides)
10. [Database Schema](#database-schema)
11. [Changelog](#changelog)

---

## Architecture Overview

### System Design
The Marketing Workflow Engine is a **monolithic NestJS backend** with a **Next.js frontend**, designed to autonomously manage multi-platform marketing campaigns powered by AI orchestration.

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATIONS                       │
│  Next.js Admin Dashboard | React Native Mobile (future)     │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST APIs (HTTP/JSON)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY (NestJS)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Authentication Middleware (JWT + Passport.js)       │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Marketing  │ │Intelligence │ │   ML Lab    │
│  Controller │ │  Controller │ │  Controller │
│ 170 endpoints│ │ 26 endpoints│ │ 18 endpoints│
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘
       │               │               │
       └───────────────┼───────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   SERVICE LAYER (89 Services)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  Trend   │ │   SEO    │ │  Video   │ │Publishing│       │
│  │ Services │ │ Services │ │ Services │ │ Services │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │   ML     │ │Algorithm │ │Authority │ │Creative  │       │
│  │ Services │ │ Services │ │ Services │ │ Services │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└──────────────────────┬──────────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ PostgreSQL  │ │    Redis    │ │ Bull Queue  │
│  (Prisma)   │ │   (Cache)   │ │   (Jobs)    │
└─────────────┘ └─────────────┘ └─────────────┘
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Claude    │ │  External   │ │   Social    │
│  AI Agents  │ │  Trend APIs │ │  Platforms  │
└─────────────┘ └─────────────┘ └─────────────┘
```

### Technology Stack

**Backend**:
- **Framework**: NestJS 10.x (TypeScript)
- **Database**: PostgreSQL 15+ with Prisma ORM 5.x
- **Caching**: Redis 7.x
- **Queue**: Bull (Redis-based job queue)
- **Search**: Elasticsearch 8.x (planned)
- **Time-series**: TimescaleDB (planned)
- **Vector DB**: Pinecone (planned)
- **Authentication**: JWT with Passport.js

**Frontend**:
- **Framework**: Next.js 14.x (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **UI Components**: shadcn/ui
- **State Management**: React hooks + Context API
- **API Client**: Native Fetch API with custom wrapper

**AI/ML**:
- **Primary AI**: Claude 3.5 Sonnet (complex reasoning, content generation)
- **Fast AI**: Claude 3.5 Haiku (simple classification, quick responses)
- **Vision**: GPT-4 Vision (image analysis)
- **Video**: Runway Gen-3, Pika Labs (planned)
- **Voice**: ElevenLabs (planned)
- **Music**: Suno AI (planned)

**External APIs**:
- **Social**: Facebook Graph API, Instagram API, LinkedIn API, TikTok API, Twitter API v2, YouTube Data API, Pinterest API, Reddit API
- **Trends**: Google Trends (via SerpAPI), Twitter Trends, Reddit Hot/New
- **SEO**: Google Search Console (planned), Ahrefs API (planned), SEMrush API (planned)

### Base URL
```
Development: http://localhost:3001/api
Production: https://api.dryjets.com
```

### API Versioning
Currently using **implicit v1** (no version in URL). Future versions will use path-based versioning:
```
/api/v1/marketing/...
/api/v2/marketing/...
```

### Data Formats
- **Request**: JSON (`Content-Type: application/json`)
- **Response**: JSON
- **Date/Time**: ISO 8601 format (e.g., `2025-10-29T14:30:00Z`)
- **Pagination**: Cursor-based or offset-based depending on endpoint

---

## Authentication & Authorization

### Authentication Flow

#### 1. Sign Up / Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "marketer@example.com",
  "password": "SecureP@ssw0rd123",
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "BUSINESS"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clv1x2y3z4a5b6c7d8e9f0g1",
      "email": "marketer@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "role": "BUSINESS",
      "status": "PENDING_VERIFICATION"
    },
    "message": "Verification email sent to marketer@example.com"
  }
}
```

#### 2. Email Verification
```http
GET /api/auth/verify-email?token=<verification_token>
```

**Response**:
```json
{
  "success": true,
  "message": "Email verified successfully. You can now log in."
}
```

#### 3. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "marketer@example.com",
  "password": "SecureP@ssw0rd123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clv1x2y3z4a5b6c7d8e9f0g1",
      "email": "marketer@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "role": "BUSINESS",
      "status": "ACTIVE"
    },
    "expiresIn": 3600
  }
}
```

#### 4. Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

#### 5. Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Authorization

All protected endpoints require a **JWT Bearer token** in the `Authorization` header:

```http
GET /api/marketing/profiles
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### JWT Payload
```json
{
  "sub": "clv1x2y3z4a5b6c7d8e9f0g1",
  "email": "marketer@example.com",
  "role": "BUSINESS",
  "iat": 1730203800,
  "exp": 1730207400
}
```

### Roles & Permissions

| Role | Description | Access Level |
|------|-------------|--------------|
| **ADMIN** | System administrator | Full system access |
| **BUSINESS** | Business account (marketing agency/company) | Full marketing features |
| **CUSTOMER** | End customer (dry cleaning platform) | Limited to customer features |
| **MERCHANT** | Merchant (dry cleaning platform) | Limited to merchant features |
| **DRIVER** | Driver (dry cleaning platform) | Limited to driver features |

**Note**: Marketing Engine is primarily used by `BUSINESS` and `ADMIN` roles.

---

## Quick Start

### 1. Create an Account
```bash
curl -X POST https://api.dryjets.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "YourPassword123",
    "firstName": "Your",
    "lastName": "Name",
    "role": "BUSINESS"
  }'
```

### 2. Verify Email & Login
Check your email for verification link, then:
```bash
curl -X POST https://api.dryjets.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "YourPassword123"
  }'
```

### 3. Create a Marketing Profile
```bash
curl -X POST https://api.dryjets.com/marketing/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My SaaS Company",
    "brandVoice": "professional",
    "industry": "Software",
    "targetAudience": {
      "demographics": ["B2B", "25-45 years"],
      "interests": ["technology", "productivity"]
    },
    "goals": ["brand_awareness", "lead_generation"]
  }'
```

### 4. Connect a Platform
```bash
# Option A: OAuth (redirects user)
curl -X GET https://api.dryjets.com/marketing/profile/{profileId}/connections/twitter/oauth/initiate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Option B: API Key
curl -X POST https://api.dryjets.com/marketing/profile/{profileId}/connections \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "twitter",
    "authType": "api_key",
    "credentials": {
      "apiKey": "YOUR_TWITTER_API_KEY",
      "apiSecret": "YOUR_TWITTER_API_SECRET",
      "accessToken": "YOUR_ACCESS_TOKEN",
      "accessTokenSecret": "YOUR_ACCESS_TOKEN_SECRET"
    }
  }'
```

### 5. Create a Campaign
```bash
curl -X POST https://api.dryjets.com/marketing/campaigns \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Q4 Product Launch",
    "profileId": "clv1x2y3z4a5b6c7d8e9f0g1",
    "type": "MULTI_CHANNEL",
    "mode": "autonomous",
    "objective": "conversion",
    "platforms": ["twitter", "linkedin", "facebook"],
    "budget": 5000,
    "startDate": "2025-11-01T00:00:00Z",
    "endDate": "2025-12-31T23:59:59Z",
    "targetAudience": {
      "demographics": ["B2B", "Decision makers"],
      "interests": ["SaaS", "productivity tools"]
    }
  }'
```

### 6. Analyze Trends
```bash
curl -X POST https://api.dryjets.com/marketing/campaigns/{campaignId}/analyze-trends \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 7. View Analytics
```bash
curl -X GET https://api.dryjets.com/marketing/analytics/campaigns/{campaignId} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## API Reference

### API Summary

| Controller | Base Path | Endpoints | Status |
|------------|-----------|-----------|--------|
| **Authentication** | `/api/auth` | 6 | ✅ Complete |
| **Marketing** | `/api/marketing` | 170 | ⚠️ Partial (70%) |
| **Profile** | `/api/marketing/profile` | 33 | ⚠️ Backend 100%, Frontend 0% |
| **Intelligence** | `/api/marketing/intelligence` | 26 | ⚠️ Backend 70%, Frontend 0% |
| **ML Lab** | `/api/marketing/ml` | 18 | ⚠️ Backend 85%, Frontend 0% |
| **Optimization** | `/api/marketing/optimization` | 30 | ⚠️ Backend 85%, Frontend 0% |
| **Video** | `/api/marketing/video` | 13 | ⚠️ Scripts 100%, Video Gen 0% |
| **Workflows** | `/api/marketing/workflows` | 22 | ⚠️ Partial 35% |
| **Trends** | `/api/marketing/trends` | 20 | ⚠️ Backend 75%, APIs Partial |
| **Monitoring** | `/api/marketing/monitoring` | 20 | ⚠️ Backend 75%, Minimal UI |

**Total**: 337+ endpoints across 12 controllers

---

## Authentication APIs

### Base Path: `/api/auth`

#### POST `/auth/register`
Create a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "BUSINESS"
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clv1x2y3z4a5b6c7d8e9f0g1",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "BUSINESS",
      "status": "PENDING_VERIFICATION"
    },
    "message": "Verification email sent"
  }
}
```

**Errors**:
- `400` - Invalid email or weak password
- `409` - Email already exists

---

#### POST `/auth/login`
Authenticate user and receive JWT tokens.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd123"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "user": {
      "id": "clv1x2y3z4a5b6c7d8e9f0g1",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "BUSINESS"
    },
    "expiresIn": 3600
  }
}
```

**Errors**:
- `401` - Invalid credentials
- `403` - Email not verified

---

#### POST `/auth/refresh`
Refresh access token using refresh token.

**Request Body**:
```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "expiresIn": 3600
  }
}
```

**Errors**:
- `401` - Invalid or expired refresh token

---

#### POST `/auth/logout`
Invalidate current session.

**Headers**: `Authorization: Bearer <access_token>`

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### GET `/auth/verify-email`
Verify user email address.

**Query Parameters**:
- `token` (required): Email verification token

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Errors**:
- `400` - Invalid or expired token

---

#### POST `/auth/reset-password`
Request password reset email.

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

## Profile Management APIs

### Base Path: `/api/marketing/profile`

Marketing profiles represent individual brands or clients. Users can manage multiple profiles.

---

#### POST `/marketing/profile`
Create a new marketing profile.

**Headers**: `Authorization: Bearer <access_token>`

**Request Body**:
```json
{
  "name": "Tech Startup Inc",
  "brandVoice": "casual",
  "industry": "Software",
  "targetAudience": {
    "demographics": ["millennials", "tech-savvy"],
    "interests": ["innovation", "productivity"],
    "locations": ["United States", "Canada"],
    "languages": ["English"]
  },
  "goals": ["brand_awareness", "lead_generation", "customer_engagement"],
  "description": "B2B SaaS platform for project management"
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "profile_abc123",
      "userId": "clv1x2y3z4a5b6c7d8e9f0g1",
      "name": "Tech Startup Inc",
      "brandVoice": "casual",
      "industry": "Software",
      "targetAudience": { ... },
      "goals": ["brand_awareness", "lead_generation", "customer_engagement"],
      "status": "ACTIVE",
      "completeness": 65,
      "createdAt": "2025-10-29T14:30:00Z"
    }
  }
}
```

**Errors**:
- `400` - Invalid profile data
- `401` - Unauthorized

---

#### GET `/marketing/profile`
List all marketing profiles for the authenticated user.

**Headers**: `Authorization: Bearer <access_token>`

**Query Parameters**:
- `status` (optional): Filter by status (`ACTIVE`, `PAUSED`, `ARCHIVED`)
- `limit` (optional): Results per page (default: 20, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "profiles": [
      {
        "id": "profile_abc123",
        "name": "Tech Startup Inc",
        "brandVoice": "casual",
        "industry": "Software",
        "status": "ACTIVE",
        "completeness": 65,
        "connectedPlatforms": ["twitter", "linkedin"],
        "activeCampaigns": 3,
        "createdAt": "2025-10-29T14:30:00Z"
      }
    ],
    "pagination": {
      "total": 5,
      "limit": 20,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

---

#### GET `/marketing/profile/:id`
Get detailed information about a specific profile.

**Headers**: `Authorization: Bearer <access_token>`

**Path Parameters**:
- `id` (required): Profile ID

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "profile_abc123",
      "userId": "clv1x2y3z4a5b6c7d8e9f0g1",
      "name": "Tech Startup Inc",
      "brandVoice": "casual",
      "industry": "Software",
      "targetAudience": {
        "demographics": ["millennials", "tech-savvy"],
        "interests": ["innovation", "productivity"],
        "locations": ["United States", "Canada"],
        "languages": ["English"]
      },
      "goals": ["brand_awareness", "lead_generation"],
      "description": "B2B SaaS platform for project management",
      "status": "ACTIVE",
      "completeness": 65,
      "platforms": [
        {
          "platform": "twitter",
          "connected": true,
          "health": "healthy",
          "lastSync": "2025-10-29T13:00:00Z"
        },
        {
          "platform": "linkedin",
          "connected": true,
          "health": "healthy",
          "lastSync": "2025-10-29T13:15:00Z"
        }
      ],
      "statistics": {
        "totalCampaigns": 12,
        "activeCampaigns": 3,
        "totalContent": 487,
        "publishedContent": 423,
        "totalReach": 125000,
        "totalEngagement": 8500
      },
      "createdAt": "2025-10-29T14:30:00Z",
      "updatedAt": "2025-10-29T15:45:00Z"
    }
  }
}
```

**Errors**:
- `404` - Profile not found
- `403` - Not authorized to view this profile

---

#### PATCH `/marketing/profile/:id`
Update profile information.

**Headers**: `Authorization: Bearer <access_token>`

**Path Parameters**:
- `id` (required): Profile ID

**Request Body** (all fields optional):
```json
{
  "name": "Tech Startup Inc - Updated",
  "brandVoice": "professional",
  "targetAudience": {
    "demographics": ["millennials", "gen-z", "tech-savvy"]
  },
  "goals": ["brand_awareness", "lead_generation", "customer_retention"]
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "profile_abc123",
      "name": "Tech Startup Inc - Updated",
      "brandVoice": "professional",
      ...
    }
  }
}
```

---

#### DELETE `/marketing/profile/:id`
Delete a marketing profile (soft delete).

**Headers**: `Authorization: Bearer <access_token>`

**Path Parameters**:
- `id` (required): Profile ID

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Profile deleted successfully"
}
```

**Errors**:
- `400` - Cannot delete profile with active campaigns
- `404` - Profile not found

---

#### POST `/marketing/profile/:id/activate`
Activate a paused profile.

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "profile_abc123",
      "status": "ACTIVE"
    }
  }
}
```

---

#### POST `/marketing/profile/:id/pause`
Pause an active profile.

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "profile_abc123",
      "status": "PAUSED"
    }
  }
}
```

---

#### POST `/marketing/profile/:id/archive`
Archive a profile (can be restored later).

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Profile archived successfully"
}
```

---

#### GET `/marketing/profile/:id/stats`
Get detailed statistics for a profile.

**Query Parameters**:
- `period` (optional): Time period (`7d`, `30d`, `90d`, `1y`, `all`) (default: `30d`)

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "stats": {
      "period": "30d",
      "campaigns": {
        "total": 12,
        "active": 3,
        "completed": 8,
        "paused": 1
      },
      "content": {
        "generated": 145,
        "published": 132,
        "scheduled": 13
      },
      "performance": {
        "impressions": 456000,
        "engagement": 28500,
        "clicks": 12300,
        "conversions": 487,
        "reach": 125000,
        "engagementRate": 6.25,
        "ctr": 2.7,
        "conversionRate": 3.96
      },
      "platforms": [
        {
          "platform": "twitter",
          "impressions": 180000,
          "engagement": 11200,
          "followers": 5400
        },
        {
          "platform": "linkedin",
          "impressions": 276000,
          "engagement": 17300,
          "followers": 8700
        }
      ],
      "topContent": [
        {
          "id": "content_xyz789",
          "platform": "linkedin",
          "type": "POST",
          "impressions": 45000,
          "engagement": 3200,
          "engagementRate": 7.11
        }
      ]
    }
  }
}
```

---

### Platform Connections

#### POST `/marketing/profile/:id/connections`
Connect a platform using API key method.

**Request Body**:
```json
{
  "platform": "twitter",
  "authType": "api_key",
  "credentials": {
    "apiKey": "YOUR_API_KEY",
    "apiSecret": "YOUR_API_SECRET",
    "accessToken": "YOUR_ACCESS_TOKEN",
    "accessTokenSecret": "YOUR_ACCESS_TOKEN_SECRET"
  }
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "connection": {
      "id": "conn_abc123",
      "profileId": "profile_abc123",
      "platform": "twitter",
      "status": "connected",
      "health": "healthy",
      "connectedAt": "2025-10-29T14:30:00Z"
    }
  }
}
```

---

#### GET `/marketing/profile/:id/connections/:platform/oauth/initiate`
Initiate OAuth flow for a platform.

**Path Parameters**:
- `id`: Profile ID
- `platform`: Platform name (`twitter`, `linkedin`, `facebook`, `tiktok`, `youtube`)

**Response**: `302 Redirect`
Redirects to platform's OAuth authorization page.

---

#### GET `/marketing/profile/:id/connections/:platform/oauth/callback`
OAuth callback handler (automatically called by platform).

**Query Parameters**:
- `code`: OAuth authorization code
- `state`: CSRF protection token

**Response**: `302 Redirect`
Redirects to frontend with connection status.

---

#### GET `/marketing/profile/:id/connections`
List all platform connections for a profile.

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "connections": [
      {
        "id": "conn_abc123",
        "platform": "twitter",
        "status": "connected",
        "health": "healthy",
        "lastSync": "2025-10-29T13:00:00Z",
        "accountInfo": {
          "username": "@techstartup",
          "followers": 5400,
          "verified": false
        }
      },
      {
        "id": "conn_def456",
        "platform": "linkedin",
        "status": "connected",
        "health": "healthy",
        "lastSync": "2025-10-29T13:15:00Z",
        "accountInfo": {
          "companyName": "Tech Startup Inc",
          "followers": 8700
        }
      }
    ]
  }
}
```

---

#### GET `/marketing/profile/:id/connections/:platform/health`
Check connection health for a platform.

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "health": {
      "platform": "twitter",
      "status": "healthy",
      "lastSync": "2025-10-29T13:00:00Z",
      "lastSuccessfulPost": "2025-10-29T12:45:00Z",
      "errors": [],
      "warnings": [],
      "rateLimits": {
        "posts": {
          "limit": 50,
          "remaining": 42,
          "resetAt": "2025-10-29T15:00:00Z"
        }
      }
    }
  }
}
```

---

#### DELETE `/marketing/profile/:id/connections/:platform`
Disconnect a platform.

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Platform disconnected successfully"
}
```

---

### Profile Strategy & Intelligence

#### POST `/marketing/profile/:id/strategy/analyze`
Analyze market landscape for a profile.

**Request Body**:
```json
{
  "competitors": ["competitor1.com", "competitor2.com"],
  "keywords": ["project management", "team collaboration", "productivity"],
  "platforms": ["twitter", "linkedin", "youtube"]
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "analysis": {
      "marketOverview": {
        "size": "large",
        "growth": "high",
        "competition": "moderate",
        "trends": ["remote work", "AI integration", "automation"]
      },
      "competitors": [
        {
          "name": "Competitor 1",
          "domain": "competitor1.com",
          "strengths": ["Large following", "High engagement", "Video content"],
          "weaknesses": ["Inconsistent posting", "Limited platforms"],
          "contentStrategy": "Educational content, weekly webinars",
          "estimatedReach": 250000
        }
      ],
      "opportunities": [
        "Underutilized TikTok platform",
        "Growing demand for short-form video tutorials",
        "Gap in content about AI automation"
      ],
      "threats": [
        "Increasing ad costs on LinkedIn",
        "Algorithm changes on Twitter"
      ],
      "recommendations": [
        "Launch TikTok channel with product demos",
        "Create AI-focused content series",
        "Invest in SEO for long-tail keywords"
      ]
    }
  }
}
```

---

#### POST `/marketing/profile/:id/strategy/generate`
Generate marketing strategy for a profile.

**Request Body**:
```json
{
  "campaignGoal": "lead_generation",
  "budget": 10000,
  "duration": "90 days",
  "platforms": ["linkedin", "twitter", "youtube"]
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "strategy": {
      "overview": {
        "goal": "Generate 500 qualified leads in 90 days",
        "budget": 10000,
        "projectedROI": "8.5x",
        "confidence": "high"
      },
      "platformAllocation": [
        {
          "platform": "linkedin",
          "budget": 6000,
          "focus": "Sponsored content + InMail campaigns",
          "expectedLeads": 300,
          "expectedCPL": 20
        },
        {
          "platform": "twitter",
          "budget": 2000,
          "focus": "Organic threads + promoted tweets",
          "expectedLeads": 100,
          "expectedCPL": 20
        },
        {
          "platform": "youtube",
          "budget": 2000,
          "focus": "Educational videos + ads",
          "expectedLeads": 100,
          "expectedCPL": 20
        }
      ],
      "contentPlan": {
        "linkedin": {
          "frequency": "5 posts/week",
          "types": ["thought leadership", "case studies", "product updates"],
          "bestTimes": ["Tue 10am", "Wed 2pm", "Thu 11am"]
        },
        "twitter": {
          "frequency": "3 threads/week",
          "types": ["tips & tricks", "industry insights", "product features"],
          "bestTimes": ["Mon 9am", "Wed 3pm", "Fri 10am"]
        },
        "youtube": {
          "frequency": "2 videos/week",
          "types": ["tutorials", "demos", "customer interviews"],
          "bestTimes": ["Tue 6pm", "Thu 6pm"]
        }
      },
      "timeline": {
        "week1-4": "Content creation + audience building",
        "week5-8": "Campaign launch + optimization",
        "week9-12": "Scale winning content + retargeting"
      },
      "kpis": {
        "leads": 500,
        "cpl": 20,
        "contentPieces": 180,
        "videoViews": 50000,
        "engagementRate": 5.5
      }
    }
  }
}
```

---

#### POST `/marketing/profile/:id/repurpose/rules`
Set content repurposing rules for a profile.

**Request Body**:
```json
{
  "sourcePlatform": "blog",
  "targetPlatforms": ["twitter", "linkedin", "instagram", "tiktok"],
  "rules": {
    "twitter": {
      "variations": 10,
      "includeThreads": true,
      "maxLength": 280,
      "tone": "casual"
    },
    "linkedin": {
      "variations": 5,
      "maxLength": 3000,
      "tone": "professional",
      "includeHashtags": true
    },
    "instagram": {
      "variations": 3,
      "captionLength": 2200,
      "hashtagCount": 15,
      "tone": "engaging"
    },
    "tiktok": {
      "variations": 2,
      "scriptLength": 150,
      "tone": "casual",
      "hooks": ["attention-grabbing"]
    }
  }
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "rules": {
      "id": "rules_abc123",
      "profileId": "profile_abc123",
      ...
    }
  }
}
```

---

## Campaign Management APIs

### Base Path: `/api/marketing/campaigns`

---

#### POST `/marketing/campaigns`
Create a new marketing campaign.

**Request Body**:
```json
{
  "name": "Q4 Product Launch Campaign",
  "profileId": "profile_abc123",
  "type": "MULTI_CHANNEL",
  "mode": "autonomous",
  "objective": "conversion",
  "description": "Launch new AI features with focus on lead generation",
  "platforms": ["twitter", "linkedin", "facebook", "youtube"],
  "budget": 15000,
  "startDate": "2025-11-01T00:00:00Z",
  "endDate": "2025-12-31T23:59:59Z",
  "targetAudience": {
    "demographics": ["B2B", "Decision makers", "25-55 years"],
    "interests": ["SaaS", "AI", "automation", "productivity"],
    "locations": ["United States", "Canada", "United Kingdom"],
    "industries": ["Technology", "Finance", "Healthcare"]
  },
  "tone": ["professional", "innovative"],
  "keywords": ["AI automation", "productivity tools", "team collaboration"]
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": "campaign_xyz789",
      "name": "Q4 Product Launch Campaign",
      "profileId": "profile_abc123",
      "type": "MULTI_CHANNEL",
      "mode": "autonomous",
      "status": "DRAFT",
      "objective": "conversion",
      "platforms": ["twitter", "linkedin", "facebook", "youtube"],
      "budget": 15000,
      "startDate": "2025-11-01T00:00:00Z",
      "endDate": "2025-12-31T23:59:59Z",
      "createdAt": "2025-10-29T14:30:00Z"
    },
    "nextStep": "analyze_trends"
  }
}
```

---

#### GET `/marketing/campaigns`
List all campaigns.

**Query Parameters**:
- `profileId` (optional): Filter by profile
- `status` (optional): Filter by status (`DRAFT`, `SCHEDULED`, `ACTIVE`, `PAUSED`, `COMPLETED`)
- `type` (optional): Filter by type (`PAID_SEARCH`, `PAID_SOCIAL`, `EMAIL`, `SEO`, `CONTENT`, `VIDEO`, `MULTI_CHANNEL`)
- `limit` (optional): Results per page (default: 20, max: 100)
- `offset` (optional): Pagination offset

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "id": "campaign_xyz789",
        "name": "Q4 Product Launch Campaign",
        "profileId": "profile_abc123",
        "status": "ACTIVE",
        "type": "MULTI_CHANNEL",
        "objective": "conversion",
        "platforms": ["twitter", "linkedin", "facebook", "youtube"],
        "budget": 15000,
        "spent": 4500,
        "performance": {
          "impressions": 125000,
          "clicks": 5400,
          "conversions": 187,
          "ctr": 4.32,
          "conversionRate": 3.46
        },
        "startDate": "2025-11-01T00:00:00Z",
        "endDate": "2025-12-31T23:59:59Z"
      }
    ],
    "pagination": {
      "total": 24,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

#### GET `/marketing/campaigns/:id`
Get detailed campaign information.

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": "campaign_xyz789",
      "name": "Q4 Product Launch Campaign",
      "profileId": "profile_abc123",
      "profile": {
        "id": "profile_abc123",
        "name": "Tech Startup Inc"
      },
      "type": "MULTI_CHANNEL",
      "mode": "autonomous",
      "status": "ACTIVE",
      "objective": "conversion",
      "description": "Launch new AI features with focus on lead generation",
      "platforms": ["twitter", "linkedin", "facebook", "youtube"],
      "budget": 15000,
      "spent": 4500,
      "startDate": "2025-11-01T00:00:00Z",
      "endDate": "2025-12-31T23:59:59Z",
      "targetAudience": {...},
      "tone": ["professional", "innovative"],
      "keywords": ["AI automation", "productivity tools"],
      "performance": {
        "impressions": 125000,
        "reach": 87000,
        "clicks": 5400,
        "engagement": 8700,
        "conversions": 187,
        "revenue": 28050,
        "ctr": 4.32,
        "engagementRate": 6.96,
        "conversionRate": 3.46,
        "roas": 6.23,
        "cpa": 24.06
      },
      "content": {
        "total": 45,
        "published": 38,
        "scheduled": 7,
        "draft": 0
      },
      "trends": {
        "analyzed": true,
        "topTrends": [
          "AI automation surge",
          "Remote work productivity",
          "ChatGPT alternatives"
        ],
        "lastAnalyzed": "2025-10-28T10:00:00Z"
      },
      "seo": {
        "analyzed": true,
        "targetKeywords": 25,
        "quickWins": 8,
        "lastAnalyzed": "2025-10-28T10:30:00Z"
      },
      "orchestration": {
        "contentGenerated": true,
        "approved": true,
        "approvedAt": "2025-10-29T09:00:00Z"
      },
      "createdAt": "2025-10-29T14:30:00Z",
      "updatedAt": "2025-10-29T15:45:00Z"
    }
  }
}
```

---

#### PATCH `/marketing/campaigns/:id`
Update campaign details.

**Request Body** (all fields optional):
```json
{
  "name": "Q4 Product Launch - Updated",
  "budget": 18000,
  "endDate": "2025-12-31T23:59:59Z"
}
```

**Response**: `200 OK`

---

#### DELETE `/marketing/campaigns/:id`
Delete a campaign (soft delete).

**Response**: `200 OK`

---

#### POST `/marketing/campaigns/:id/analyze-trends`
Trigger trend analysis for campaign (Step 1 of autonomous workflow).

**Response**: `202 Accepted`
```json
{
  "success": true,
  "data": {
    "jobId": "job_trend_abc123",
    "status": "processing",
    "message": "Trend analysis started. This may take 2-5 minutes.",
    "estimatedCompletion": "2025-10-29T14:35:00Z"
  }
}
```

**Poll for completion**:
```bash
GET /marketing/campaigns/:id/trends/status
```

---

#### GET `/marketing/campaigns/:id/trends`
Get trend analysis results.

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "trends": {
      "analyzed": true,
      "analyzedAt": "2025-10-28T10:00:00Z",
      "topTrends": [
        {
          "keyword": "AI automation surge",
          "source": "google_trends",
          "volume": 45000,
          "growth": 285.5,
          "relevanceScore": 92,
          "viralCoefficient": 8.7,
          "lifecycle": "GROWING",
          "platforms": ["twitter", "linkedin", "youtube"],
          "opportunities": [
            "Create tutorial series on AI automation",
            "Host webinar on AI productivity tools"
          ]
        },
        {
          "keyword": "Remote work productivity",
          "source": "twitter",
          "volume": 32000,
          "growth": 145.3,
          "relevanceScore": 88,
          "viralCoefficient": 6.2,
          "lifecycle": "PEAK",
          "platforms": ["twitter", "linkedin"],
          "opportunities": [
            "Share remote work tips thread",
            "Create infographic on productivity stats"
          ]
        }
      ],
      "earlySignals": [
        {
          "keyword": "AI meeting assistants",
          "source": "reddit",
          "mentions": 487,
          "growth": 425.0,
          "relevanceScore": 85,
          "potentialReach": 120000,
          "recommendedAction": "Create early content before trend explodes"
        }
      ],
      "recommendations": [
        "Focus on AI automation content (highest relevance)",
        "Launch content on remote work productivity before peak declines",
        "Early mover advantage on AI meeting assistants"
      ]
    }
  }
}
```

---

#### POST `/marketing/campaigns/:id/analyze-seo`
Trigger SEO analysis (Step 2 of autonomous workflow).

**Response**: `202 Accepted`
```json
{
  "success": true,
  "data": {
    "jobId": "job_seo_def456",
    "status": "processing",
    "message": "SEO analysis started. This may take 3-7 minutes."
  }
}
```

---

#### GET `/marketing/campaigns/:id/seo`
Get SEO analysis results.

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "seo": {
      "analyzed": true,
      "analyzedAt": "2025-10-28T10:30:00Z",
      "keywordOpportunities": [
        {
          "keyword": "AI automation tools for teams",
          "searchVolume": 12000,
          "difficulty": 45,
          "cpc": 8.50,
          "intent": "COMMERCIAL",
          "currentRank": null,
          "opportunity": "high",
          "estimatedTraffic": 3600,
          "contentGap": true
        }
      ],
      "quickWins": [
        {
          "keyword": "best project management ai",
          "currentRank": 12,
          "targetRank": 5,
          "estimatedTrafficGain": 1200,
          "difficulty": "low",
          "actions": [
            "Add comparison table",
            "Update meta description",
            "Build 3 quality backlinks"
          ]
        }
      ],
      "longTermStrategy": {
        "targetKeywords": 25,
        "programmaticPages": 15,
        "contentClusters": 3,
        "estimatedTimeline": "6-9 months",
        "projectedTraffic": 45000
      },
      "platformStrategies": {
        "twitter": {
          "hashtags": ["#AIAutomation", "#ProductivityTools", "#TeamCollaboration"],
          "bestTimes": ["Tue 10am", "Thu 2pm"],
          "contentTypes": ["threads", "polls", "quote tweets"]
        },
        "linkedin": {
          "hashtags": ["#AI", "#Productivity", "#B2BSaaS"],
          "bestTimes": ["Wed 9am", "Thu 11am"],
          "contentTypes": ["articles", "carousels", "videos"]
        }
      }
    }
  }
}
```

---

#### POST `/marketing/campaigns/:id/orchestrate`
Trigger campaign orchestration (Step 3 - content generation).

**Request Body** (optional overrides):
```json
{
  "contentTypes": ["text", "image", "video"],
  "postingFrequency": {
    "twitter": "daily",
    "linkedin": "3x/week",
    "youtube": "weekly"
  }
}
```

**Response**: `202 Accepted`
```json
{
  "success": true,
  "data": {
    "jobId": "job_orchestrate_ghi789",
    "status": "processing",
    "message": "Campaign orchestration started. This may take 5-10 minutes.",
    "estimatedCompletion": "2025-10-29T14:45:00Z"
  }
}
```

---

#### GET `/marketing/campaigns/:id/orchestration`
Get orchestration results (content plan + generated content).

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "orchestration": {
      "completed": true,
      "completedAt": "2025-10-29T09:00:00Z",
      "contentStrategy": {
        "totalPieces": 45,
        "byPlatform": {
          "twitter": 20,
          "linkedin": 15,
          "facebook": 5,
          "youtube": 5
        },
        "byType": {
          "text": 35,
          "image": 5,
          "video": 5
        },
        "timeline": "60 days",
        "frequency": "3-5 posts/day across all platforms"
      },
      "content": [
        {
          "id": "content_aaa111",
          "platform": "twitter",
          "type": "THREAD",
          "status": "READY",
          "content": {
            "tweets": [
              "🚀 AI automation is transforming how teams work. Here's what you need to know about the latest trends... [1/7]",
              "First, AI tools are now 10x more accessible than last year. No coding required. [2/7]",
              ...
            ],
            "hashtags": ["#AIAutomation", "#ProductivityTools"],
            "mediaUrls": []
          },
          "scheduledFor": "2025-11-01T10:00:00Z",
          "estimatedReach": 5400,
          "estimatedEngagement": 324
        },
        {
          "id": "content_bbb222",
          "platform": "linkedin",
          "type": "ARTICLE",
          "status": "READY",
          "content": {
            "title": "The Future of AI-Powered Team Collaboration",
            "body": "In 2025, AI is no longer a luxury—it's a necessity...",
            "hashtags": ["#AI", "#B2BSaaS"],
            "imageUrl": "https://cdn.example.com/ai-collab.jpg"
          },
          "scheduledFor": "2025-11-01T14:00:00Z",
          "estimatedReach": 8700,
          "estimatedEngagement": 609
        }
      ],
      "postingSchedule": [
        {
          "date": "2025-11-01",
          "posts": 5,
          "platforms": ["twitter", "linkedin", "facebook"]
        }
      ],
      "approved": false,
      "requiresApproval": true
    }
  }
}
```

---

#### POST `/marketing/campaigns/:id/approve`
Approve orchestrated campaign plan (Step 4 - human approval gate).

**Request Body** (optional modifications):
```json
{
  "approve": true,
  "modifications": {
    "content_aaa111": {
      "scheduledFor": "2025-11-01T12:00:00Z"
    },
    "content_bbb222": {
      "content": {
        "title": "The Future of AI-Powered Team Collaboration - Updated"
      }
    }
  }
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": "campaign_xyz789",
      "status": "SCHEDULED",
      "orchestration": {
        "approved": true,
        "approvedAt": "2025-10-29T15:00:00Z"
      }
    },
    "message": "Campaign approved and scheduled for publishing"
  }
}
```

---

#### POST `/marketing/campaigns/:id/reject`
Reject and regenerate campaign plan.

**Request Body**:
```json
{
  "reason": "Tone too casual, need more professional content",
  "regenerateInstructions": "Use professional tone, add more data/statistics"
}
```

**Response**: `202 Accepted`
```json
{
  "success": true,
  "data": {
    "jobId": "job_regen_jkl012",
    "status": "processing",
    "message": "Regenerating campaign with new instructions"
  }
}
```

---

#### POST `/marketing/campaigns/:id/start`
Start an approved campaign (publish content to platforms).

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": "campaign_xyz789",
      "status": "ACTIVE",
      "startedAt": "2025-10-29T15:30:00Z"
    },
    "publishing": {
      "total": 45,
      "published": 5,
      "scheduled": 40,
      "failed": 0
    }
  }
}
```

---

#### POST `/marketing/campaigns/:id/pause`
Pause an active campaign.

**Response**: `200 OK`

---

#### POST `/marketing/campaigns/:id/resume`
Resume a paused campaign.

**Response**: `200 OK`

---

#### POST `/marketing/campaigns/:id/end`
End a campaign early.

**Response**: `200 OK`

---

## Content Creation APIs

### Base Path: `/api/marketing/content`

---

#### POST `/marketing/content/blog/generate`
Generate a blog post using AI (Mira agent).

**Request Body**:
```json
{
  "profileId": "profile_abc123",
  "topic": "10 Ways AI is Transforming Project Management in 2025",
  "keywords": ["AI", "project management", "automation", "productivity"],
  "tone": "professional",
  "length": "medium",
  "targetAudience": "B2B decision makers",
  "includeImages": true,
  "seoOptimize": true
}
```

**Length options**: `short` (800-1200 words), `medium` (1500-2000 words), `long` (2500-3500 words)

**Response**: `202 Accepted`
```json
{
  "success": true,
  "data": {
    "jobId": "job_blog_mno345",
    "status": "processing",
    "message": "Blog generation started. This may take 1-3 minutes.",
    "estimatedCompletion": "2025-10-29T15:33:00Z"
  }
}
```

**Poll for completion**:
```bash
GET /marketing/content/blog/:jobId/status
```

---

#### GET `/marketing/content/blog/:id`
Get generated blog post.

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "blog": {
      "id": "blog_pqr678",
      "profileId": "profile_abc123",
      "title": "10 Ways AI is Transforming Project Management in 2025",
      "slug": "10-ways-ai-transforming-project-management-2025",
      "content": "# Introduction\n\nIn 2025, artificial intelligence has become...",
      "excerpt": "Discover how AI is revolutionizing project management with these 10 game-changing innovations...",
      "status": "DRAFT",
      "wordCount": 1847,
      "readingTime": 7,
      "metaTitle": "10 Ways AI is Transforming Project Management in 2025 | Tech Startup",
      "metaDescription": "Discover how AI is revolutionizing project management with automation, predictive analytics, and intelligent resource allocation.",
      "keywords": ["AI", "project management", "automation", "productivity"],
      "tone": "professional",
      "targetAudience": "B2B decision makers",
      "images": [
        {
          "url": "https://cdn.example.com/ai-pm-1.jpg",
          "alt": "AI-powered project management dashboard",
          "caption": "Modern AI project management interface"
        }
      ],
      "seo": {
        "score": 87,
        "primaryKeyword": "AI project management",
        "keywordDensity": 2.3,
        "suggestions": [
          "Add internal links to related content",
          "Increase keyword usage in H2 headings"
        ]
      },
      "createdAt": "2025-10-29T15:32:00Z",
      "generatedBy": "Mira (Claude 3.5 Sonnet)"
    }
  }
}
```

---

#### POST `/marketing/content/repurpose`
Repurpose content for multiple platforms (Leo agent).

**Request Body**:
```json
{
  "sourceBlogId": "blog_pqr678",
  "targetPlatforms": ["twitter", "linkedin", "instagram", "tiktok", "youtube"],
  "rules": {
    "twitter": {
      "variations": 10,
      "includeThreads": true
    },
    "linkedin": {
      "variations": 5,
      "tone": "professional"
    },
    "instagram": {
      "variations": 3,
      "maxHashtags": 15
    },
    "tiktok": {
      "variations": 2,
      "scriptOnly": true
    },
    "youtube": {
      "variations": 1,
      "scriptOnly": true
    }
  }
}
```

**Response**: `202 Accepted`
```json
{
  "success": true,
  "data": {
    "jobId": "job_repurpose_stu901",
    "status": "processing",
    "message": "Content repurposing started. This may take 2-4 minutes.",
    "estimatedOutput": {
      "twitter": 10,
      "linkedin": 5,
      "instagram": 3,
      "tiktok": 2,
      "youtube": 1,
      "total": 21
    }
  }
}
```

---

#### GET `/marketing/content/repurpose/:jobId`
Get repurposed content.

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "repurposed": {
      "jobId": "job_repurpose_stu901",
      "sourceBlogId": "blog_pqr678",
      "status": "completed",
      "completedAt": "2025-10-29T15:36:00Z",
      "content": {
        "twitter": [
          {
            "id": "twitter_001",
            "type": "THREAD",
            "content": [
              "🚀 AI is transforming project management in 2025. Here are 10 game-changing ways: [1/11]",
              "1️⃣ Predictive Resource Allocation: AI analyzes team capacity and predicts bottlenecks before they happen. [2/11]",
              ...
            ],
            "hashtags": ["#AIProjectManagement", "#ProductivityTools"],
            "estimatedEngagement": "high"
          },
          {
            "id": "twitter_002",
            "type": "SINGLE",
            "content": "Project managers: Stop guessing task durations. AI can now predict them with 87% accuracy based on historical data. 🤯\n\n#AI #ProjectManagement #Automation",
            "hashtags": ["#AI", "#ProjectManagement", "#Automation"]
          }
        ],
        "linkedin": [
          {
            "id": "linkedin_001",
            "type": "POST",
            "content": "In 2025, AI is no longer a buzzword in project management—it's a necessity.\n\nHere are 10 ways AI is transforming how we manage projects:\n\n1. Predictive Resource Allocation...",
            "hashtags": ["#AI", "#ProjectManagement", "#B2BSaaS"],
            "estimatedReach": 8700
          }
        ],
        "instagram": [
          {
            "id": "instagram_001",
            "type": "CAPTION",
            "content": "AI is changing the game for project managers 🚀\n\nSwipe to see 10 ways AI is transforming project management in 2025 👉",
            "hashtags": ["#AI", "#ProjectManagement", "#Productivity", "#BusinessTools", "#TechInnovation", "#Automation", "#WorkSmarter", "#B2B", "#SaaS", "#DigitalTransformation", "#TeamCollaboration", "#FutureOfWork", "#AITools", "#Management", "#Efficiency"],
            "captionLength": 127,
            "hashtagCount": 15
          }
        ],
        "tiktok": [
          {
            "id": "tiktok_001",
            "type": "SCRIPT",
            "content": {
              "hook": "Did you know AI can now predict project delays before they happen?",
              "body": "In 2025, AI project management tools are changing everything. Here are 3 mind-blowing features...",
              "cta": "Follow for more AI productivity tips!"
            },
            "duration": "60 seconds",
            "style": "Educational + Engaging"
          }
        ],
        "youtube": [
          {
            "id": "youtube_001",
            "type": "SCRIPT",
            "content": {
              "title": "10 Ways AI is Transforming Project Management in 2025",
              "description": "Discover how artificial intelligence is revolutionizing project management...",
              "script": "[INTRO]\nHey everyone, welcome back to the channel...",
              "timestamps": [
                "0:00 - Introduction",
                "1:15 - Predictive Resource Allocation",
                ...
              ],
              "cta": "Subscribe for weekly AI and productivity content"
            },
            "duration": "12 minutes",
            "style": "Educational"
          }
        ]
      },
      "stats": {
        "total": 21,
        "byPlatform": {
          "twitter": 10,
          "linkedin": 5,
          "instagram": 3,
          "tiktok": 2,
          "youtube": 1
        },
        "estimatedTotalReach": 45000
      }
    }
  }
}
```

---

#### GET `/marketing/content`
List all content assets.

**Query Parameters**:
- `profileId` (optional): Filter by profile
- `platform` (optional): Filter by platform
- `type` (optional): Filter by type (`TEXT`, `IMAGE`, `VIDEO`, `CAROUSEL`)
- `status` (optional): Filter by status (`DRAFT`, `READY`, `PUBLISHED`, `SCHEDULED`)
- `limit` (optional): Results per page (default: 20)
- `offset` (optional): Pagination offset

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "content_aaa111",
        "platform": "twitter",
        "type": "THREAD",
        "status": "PUBLISHED",
        "publishedAt": "2025-10-29T10:00:00Z",
        "performance": {
          "impressions": 5400,
          "engagement": 324,
          "clicks": 87
        }
      }
    ],
    "pagination": {...}
  }
}
```

---

## Trend Intelligence APIs

### Base Path: `/api/marketing/trends`

---

#### POST `/marketing/trends/collect`
Collect live trends from multiple platforms.

**Request Body**:
```json
{
  "sources": ["google", "twitter", "reddit", "tiktok", "youtube"],
  "keywords": ["AI automation", "productivity tools", "remote work"],
  "locations": ["United States", "Canada"],
  "filters": {
    "minVolume": 1000,
    "lifecycle": ["EMERGING", "GROWING"]
  }
}
```

**Response**: `202 Accepted`
```json
{
  "success": true,
  "data": {
    "jobId": "job_trends_vwx234",
    "status": "processing",
    "message": "Trend collection started across 5 platforms"
  }
}
```

---

#### GET `/marketing/trends`
Get current trending topics.

**Query Parameters**:
- `source` (optional): Filter by source (`google`, `twitter`, `reddit`, `tiktok`, `youtube`, `news`)
- `pillar` (optional): Filter by content pillar
- `limit` (optional): Results (default: 20, max: 100)

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "id": "trend_zzz999",
        "source": "google",
        "keyword": "AI automation surge",
        "volume": 45000,
        "growth": 285.5,
        "lifecycle": "GROWING",
        "relevanceScore": 92,
        "viralCoefficient": 8.7,
        "sentiment": 0.82,
        "capturedAt": "2025-10-29T14:00:00Z",
        "platforms": ["twitter", "linkedin", "youtube"],
        "relatedKeywords": ["AI tools", "automation software", "AI productivity"],
        "demographics": {
          "age": ["25-34", "35-44"],
          "interests": ["Technology", "Business", "Productivity"]
        }
      }
    ]
  }
}
```

---

#### POST `/marketing/trends/predict`
Predict future trend growth.

**Request Body**:
```json
{
  "trendId": "trend_zzz999"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "prediction": {
      "trendId": "trend_zzz999",
      "keyword": "AI automation surge",
      "currentVolume": 45000,
      "predictions": [
        {
          "date": "2025-11-05",
          "volumeEstimate": 62000,
          "confidence": 0.87
        },
        {
          "date": "2025-11-12",
          "volumeEstimate": 85000,
          "confidence": 0.78
        }
      ],
      "peakEstimate": {
        "date": "2025-11-20",
        "volume": 120000,
        "confidence": 0.65
      },
      "recommendedAction": "Create content now to ride the wave to peak"
    }
  }
}
```

---

#### GET `/marketing/trends/opportunities`
Get urgent trend opportunities (early signals).

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "opportunities": [
      {
        "keyword": "AI meeting assistants",
        "source": "reddit",
        "mentions": 487,
        "growth": 425.0,
        "lifecycle": "EMERGING",
        "relevanceScore": 85,
        "urgency": "high",
        "potentialReach": 120000,
        "competitionLevel": "low",
        "windowOfOpportunity": "7-14 days",
        "recommendedActions": [
          "Create early content before trend explodes",
          "Position as thought leader in this space",
          "Publish within 72 hours for maximum impact"
        ]
      }
    ]
  }
}
```

---

*(Due to length constraints, I'll continue with condensed documentation for remaining APIs. The full version would follow the same detailed pattern.)*

---

## SEO Automation APIs

### Base Path: `/api/marketing/seo`

- `POST /seo/keywords/discover` - Discover keyword universe
- `GET /seo/keywords` - List all tracked keywords
- `GET /seo/keywords/:id` - Get keyword details
- `POST /seo/keywords/:id/track` - Start tracking keyword
- `POST /seo/programmatic-pages/generate` - Generate programmatic pages at scale
- `GET /seo/programmatic-pages` - List programmatic pages
- `POST /seo/serp/track` - Track SERP rankings
- `GET /seo/serp/rankings` - Get current rankings
- `POST /seo/snippets/opportunities` - Find featured snippet opportunities
- `POST /seo/snippets/optimize` - Optimize for featured snippets
- `POST /seo/schema/generate` - Generate schema markup
- `POST /seo/clusters/create` - Create content cluster (hub & spoke)
- `GET /seo/competitors/analyze` - Analyze competitor SEO

---

## Video Studio APIs

### Base Path: `/api/marketing/video`

- `POST /video/script/generate` - Generate video script
- `POST /video/script/:id/variations` - Create script variations
- `GET /video/script/:id` - Get video script
- `POST /video/metadata/generate` - Generate video metadata (title, description, tags)
- `POST /video/hashtags/generate` - Generate video hashtags
- `POST /video/format/specs` - Get platform formatting specs
- `POST /video/format/ffmpeg` - Generate FFmpeg commands
- `POST /video/dna/create` - Create Video DNA profile
- `POST /video/generate/runway` - Generate video with Runway Gen-3 ⚠️ (Not implemented)
- `POST /video/generate/pika` - Generate video with Pika Labs ⚠️ (Not implemented)
- `POST /video/voice/elevenlabs` - Synthesize voice with ElevenLabs ⚠️ (Not implemented)
- `POST /video/music/suno` - Generate music with Suno AI ⚠️ (Not implemented)
- `GET /video/:id/stats` - Get video production stats

---

## Publishing & Distribution APIs

### Base Path: `/api/marketing/publishing`

- `POST /publishing/schedule` - Schedule content for publishing
- `POST /publishing/publish` - Publish content immediately
- `GET /publishing/queue` - View publishing queue
- `PATCH /publishing/:id/reschedule` - Reschedule post
- `DELETE /publishing/:id/cancel` - Cancel scheduled post
- `POST /publishing/:id/retry` - Retry failed publication
- `GET /publishing/:id/status` - Get publishing status
- `POST /publishing/bulk` - Bulk publish content
- `GET /publishing/calendar` - View publishing calendar
- `POST /publishing/:platform/test` - Test platform connection
- `GET /publishing/domains` - List connected domains
- `GET /publishing/stats` - Get publishing statistics

---

## Analytics & Reporting APIs

### Base Path: `/api/marketing/analytics`

- `GET /analytics/dashboard` - Get analytics dashboard overview
- `GET /analytics/campaigns` - List all campaigns with metrics
- `GET /analytics/campaigns/:id` - Get campaign analytics
- `GET /analytics/campaigns/:id/platform/:platform` - Get platform-specific analytics
- `GET /analytics/content/:id` - Get content performance
- `GET /analytics/keywords` - Get keyword performance
- `GET /analytics/serp` - Get SERP ranking analytics
- `GET /analytics/demographics` - Get audience demographics
- `GET /analytics/engagement` - Get engagement metrics
- `GET /analytics/conversions` - Get conversion tracking
- `GET /analytics/roi` - Calculate ROI
- `GET /analytics/reports/weekly` - Generate weekly report
- `GET /analytics/reports/monthly` - Generate monthly report
- `POST /analytics/reports/custom` - Generate custom report
- `GET /analytics/compare` - Compare campaigns
- `GET /analytics/trends` - Analytics trends over time
- `POST /analytics/export` - Export analytics data

---

## Intelligence Dashboard APIs

### Base Path: `/api/marketing/intelligence`

- `POST /intelligence/narrative/generate` - Generate neural narrative
- `POST /intelligence/narrative/analyze` - Analyze story narratives
- `POST /intelligence/narrative/cliffhangers` - Generate cliffhanger hooks
- `GET /intelligence/growth/platforms` - Get platform growth data
- `GET /intelligence/growth/calendar` - View growth calendar
- `POST /intelligence/forecasting/quantum` - Quantum forecasting
- `POST /intelligence/forecasting/communities` - Forecast trending communities
- `POST /intelligence/forecasting/cultural` - Cultural wave forecasting
- `GET /intelligence/algorithm/experiments` - View algorithm experiments
- `GET /intelligence/algorithm/insights` - Get platform algorithm insights
- `POST /intelligence/eeat/audit` - E-E-A-T audit
- `POST /intelligence/eeat/roadmap` - Generate authority roadmap
- `GET /intelligence/attribution/multi-touch` - Multi-touch attribution
- `GET /intelligence/attribution/roi` - Attribution-based ROI
- `POST /intelligence/ab-testing/create` - Create A/B test
- `POST /intelligence/ab-testing/analyze` - Analyze A/B test results
- `GET /intelligence/ab-testing/:id` - Get A/B test details
- `POST /intelligence/ab-testing/recommendations` - Get test recommendations
- `POST /intelligence/creative/evaluate` - Evaluate creative performance
- `POST /intelligence/creative/brainstorm` - AI creative brainstorming
- `POST /intelligence/memory/store` - Store campaign memory
- `GET /intelligence/memory/patterns` - Get learned patterns
- `GET /intelligence/memory/campaigns/:id` - Get campaign memory
- `GET /intelligence/memory/recommendations` - Get memory-based recommendations

---

## ML Lab APIs

### Base Path: `/api/marketing/ml`

- `GET /ml/dashboard` - ML Lab dashboard overview
- `POST /ml/trends/forecast` - Forecast trend growth with ML
- `POST /ml/trends/forecast/batch` - Batch forecast multiple trends
- `GET /ml/trends/opportunities` - ML-detected opportunities
- `GET /ml/trends/predictions/:id` - Get trend prediction
- `POST /ml/content/predict` - Predict content performance
- `POST /ml/content/optimize` - ML-based content optimization
- `GET /ml/content/predictions/:id` - Get content prediction
- `POST /ml/ab-testing/smart` - Smart A/B testing with Thompson Sampling
- `POST /ml/ab-testing/variant-selection` - ML variant selection
- `POST /ml/ab-testing/analyze` - Analyze A/B test with ML
- `GET /ml/ab-testing/:id/recommendations` - Get ML recommendations
- `POST /ml/keywords/cluster` - Semantic keyword clustering
- `POST /ml/keywords/similarity` - Calculate keyword similarity
- `GET /ml/keywords/pillars` - Identify keyword pillars
- `POST /ml/campaigns/predict` - Predict campaign success
- `POST /ml/campaigns/compare` - Compare strategy options
- `GET /ml/models/status` - Get ML model status
- `POST /ml/models/train` - Train ML models (admin only)

---

## Workflows APIs

### Base Path: `/api/marketing/workflows`

- `GET /workflows/dashboard` - Workflows dashboard
- `POST /workflows/seo/run` - Run SEO workflow
- `GET /workflows/seo/status` - Get SEO workflow status
- `GET /workflows/seo/opportunities` - Get SEO opportunities
- `GET /workflows/seo/health` - SEO workflow health
- `POST /workflows/seo/plan` - Generate SEO plan
- `POST /workflows/seo/analyze` - Analyze SEO status
- `POST /workflows/seo/execute` - Execute SEO plan
- `GET /workflows/seo/quick-wins` - Get SEO quick wins
- `GET /workflows/seo/results` - Get SEO workflow results
- `POST /workflows/trends/detect` - Detect viral trends
- `POST /workflows/trends/run` - Run trends workflow
- `GET /workflows/trends/status` - Get trends workflow status
- `GET /workflows/trends/alerts` - Get trend alerts
- `POST /workflows/trends/ideas` - Generate trend-based ideas
- `POST /workflows/trends/briefs` - Generate content briefs
- `GET /workflows/trends/viral` - Get viral opportunities
- `GET /workflows/trends/early-signals` - Get early trend signals
- `POST /workflows/trends/content` - Generate trend content
- `GET /workflows/trends/results` - Get trends workflow results

---

## Optimization Center APIs

### Base Path: `/api/marketing/optimization`

- `GET /optimization/dashboard` - Optimization dashboard
- `GET /optimization/cache/stats` - Get cache statistics
- `POST /optimization/cache/clear` - Clear cache
- `POST /optimization/cache/clear/:key` - Clear specific cache key
- `POST /optimization/cache/invalidate` - Invalidate cache pattern
- `POST /optimization/cache/warm` - Warm cache
- `GET /optimization/cache/hit-rate` - Get cache hit rate
- `GET /optimization/cache/memory` - Get cache memory usage
- `GET /optimization/query/slow` - Get slow queries
- `GET /optimization/query/n-plus-one` - Detect N+1 queries
- `POST /optimization/query/analyze` - Analyze query performance
- `POST /optimization/query/optimize` - Optimize query
- `GET /optimization/query/stats` - Get query statistics
- `GET /optimization/query/bottlenecks` - Identify bottlenecks
- `GET /optimization/query/recommendations` - Get query recommendations
- `POST /optimization/query/explain` - Explain query execution plan
- `GET /optimization/performance/dashboard` - Performance dashboard
- `GET /optimization/performance/metrics` - Get performance metrics
- `POST /optimization/performance/analyze` - Analyze performance
- `GET /optimization/performance/bottlenecks` - Get performance bottlenecks
- `GET /optimization/performance/trends` - Performance trends
- `GET /optimization/performance/recommendations` - Performance recommendations
- `POST /optimization/performance/optimize` - Apply optimizations
- `GET /optimization/performance/reports` - Performance reports
- `GET /optimization/ml/stats` - ML model stats
- `POST /optimization/ml/invalidate` - Invalidate ML cache
- `POST /optimization/ml/warm` - Warm ML models
- `POST /optimization/ml/optimize` - Optimize ML inference

---

## Monitoring & Health APIs

### Base Path: `/api/marketing/monitoring`

- `GET /monitoring/health` - System health check
- `GET /monitoring/metrics` - System metrics
- `GET /monitoring/performance` - Performance metrics
- `GET /monitoring/errors` - Error logs
- `GET /monitoring/alerts` - Active alerts
- `POST /monitoring/alerts/configure` - Configure alerting
- `GET /monitoring/uptime` - System uptime
- `GET /monitoring/api/status` - API status
- `GET /monitoring/api/latency` - API latency metrics
- `GET /monitoring/api/rate-limits` - Rate limit usage
- `GET /monitoring/database/connections` - Database connections
- `GET /monitoring/database/queries` - Database query stats
- `GET /monitoring/redis/stats` - Redis statistics
- `GET /monitoring/queue/stats` - Queue statistics
- `GET /monitoring/queue/jobs` - Active jobs
- `GET /monitoring/queue/failed` - Failed jobs
- `POST /monitoring/queue/retry/:id` - Retry failed job
- `GET /monitoring/integrations` - External integration status
- `GET /monitoring/logs` - System logs
- `POST /monitoring/logs/search` - Search logs

---

## Offer-Lab APIs

**Base Path**: `/api/marketing/offer-lab`

Affiliate marketing automation system with intelligent offer sourcing, AI funnel generation, traffic deployment, and conversion optimization.

### Use-Case Diagram
[View Complete Use-Case Diagram](../docs/14-marketing-engine/OFFER_LAB_USE_CASE_DIAGRAM.md)

### Phase 1: Affiliate Intelligence & Funnel Generation

#### Offer Sync & Management (5 endpoints)

**POST `/marketing/offer-lab/sync`**
- **Description**: Trigger manual offer sync from affiliate network
- **Auth**: Required (JWT)
- **Request Body**:
  ```json
  {
    "network": "maxbounty" | "clickbank",
    "forceRefresh": boolean
  }
  ```
- **Response** (202 Accepted):
  ```json
  {
    "success": true,
    "network": "maxbounty",
    "message": "Sync job queued",
    "jobId": "job_abc123"
  }
  ```

**GET `/marketing/offer-lab/offers`**
- **Description**: List and filter available offers
- **Auth**: Required (JWT)
- **Query Parameters**:
  - `network`: Filter by affiliate network
  - `status`: `pending` | `testing` | `paused` | `scaling` | `inactive`
  - `minScore`: Minimum quality score (0-100)
  - `minPayout`: Minimum payout amount
  - `category`: Filter by category
  - `geoTarget`: Filter by GEO target
  - `searchQuery`: Full-text search
  - `page`: Page number (default: 1)
  - `pageSize`: Results per page (default: 20, max: 100)
  - `sortBy`: `score` | `payout` | `epc` | `createdAt`
  - `sortOrder`: `asc` | `desc`
- **Response** (200 OK):
  ```json
  {
    "offers": [
      {
        "id": "offer_abc123",
        "network": "maxbounty",
        "externalId": "12345",
        "title": "Premium Weight Loss Program",
        "category": ["health", "weight-loss"],
        "epc": 2.45,
        "payout": 35.00,
        "currency": "USD",
        "score": 87.5,
        "geoTargets": ["US", "CA", "UK"],
        "allowedTraffic": ["email", "social", "search"],
        "trackingLink": null,
        "status": "pending",
        "createdAt": "2025-10-29T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "pageSize": 20,
      "totalPages": 8,
      "hasMore": true
    }
  }
  ```

**GET `/marketing/offer-lab/offers/:id`**
- **Description**: Get single offer details with funnels
- **Auth**: Required (JWT)
- **Response** (200 OK):
  ```json
  {
    "id": "offer_abc123",
    "network": "maxbounty",
    "title": "Premium Weight Loss Program",
    "description": "90-day transformation program...",
    "epc": 2.45,
    "payout": 35.00,
    "score": 87.5,
    "conversionRate": 3.2,
    "geoTargets": ["US", "CA"],
    "creativeUrls": ["https://...", "https://..."],
    "previewUrl": "https://maxbounty.com/preview/12345",
    "terms": "Email submit, single opt-in",
    "trackingLink": "https://track.example.com/?aff=123",
    "activatedAt": "2025-10-29T12:00:00Z",
    "funnels": [
      {
        "id": "funnel_xyz789",
        "headline": "Lose 30 Pounds in 90 Days",
        "status": "published",
        "views": 1250,
        "clicks": 89,
        "leads": 41,
        "createdAt": "2025-10-29T14:00:00Z"
      }
    ]
  }
  ```

**PATCH `/marketing/offer-lab/offers/:id/tracking-link`**
- **Description**: Update tracking link after manual activation
- **Auth**: Required (JWT)
- **Request Body**:
  ```json
  {
    "trackingLink": "https://track.example.com/?aff=123&oid=456"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "offer": { /* updated offer */ },
    "message": "Tracking link updated successfully"
  }
  ```

**PATCH `/marketing/offer-lab/offers/:id/status`**
- **Description**: Update offer status
- **Auth**: Required (JWT)
- **Request Body**:
  ```json
  {
    "status": "testing" | "paused" | "scaling" | "inactive"
  }
  ```

#### Funnel Generation & Publishing (5 endpoints)

**POST `/marketing/offer-lab/funnels/generate`**
- **Description**: Generate AI-powered landing funnel
- **Auth**: Required (JWT)
- **Request Body**:
  ```json
  {
    "offerId": "offer_abc123",
    "template": "aida-standard" | "vsl-short" | "vsl-long" | "listicle",
    "includeLeadMagnet": true,
    "targetGeo": "US",
    "tone": "professional" | "casual" | "urgent" | "friendly",
    "length": "short" | "medium" | "long"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "funnel": {
      "id": "funnel_xyz789",
      "offerId": "offer_abc123",
      "headline": "Transform Your Body in 90 Days",
      "subheadline": "Science-backed program trusted by 10,000+ people",
      "heroImageUrl": "https://storage.example.com/images/hero.jpg",
      "bodyContent": "<div>...</div>",
      "ctaText": "Start Your Transformation",
      "ctaUrl": "https://track.example.com/?aff=123",
      "leadMagnetId": "lm_abc123",
      "fleschScore": 68,
      "status": "draft",
      "publicUrl": "/f/funnel_xyz789"
    },
    "generationTime": 12500,
    "aiTokensUsed": 4250
  }
  ```

**GET `/marketing/offer-lab/funnels`**
- **Description**: List funnels with filters
- **Auth**: Required (JWT)
- **Query Parameters**: Similar pagination to offers
- **Response**: Paginated funnel list

**GET `/marketing/offer-lab/funnels/:id`**
- **Description**: Get funnel details with metrics and validation
- **Auth**: Required (JWT)
- **Response** (200 OK):
  ```json
  {
    "id": "funnel_xyz789",
    "headline": "Transform Your Body in 90 Days",
    "bodyContent": "<div>...</div>",
    "status": "published",
    "publishedAt": "2025-10-29T15:00:00Z",
    "metrics": {
      "views": 1250,
      "clicks": 89,
      "leads": 41,
      "ctr": 7.12,
      "conversionRate": 3.28
    },
    "validation": {
      "hasTrackingLink": true,
      "hasLeadMagnet": true,
      "contentLength": 2450,
      "readabilityScore": 68,
      "isPublishable": true
    }
  }
  ```

**PATCH `/marketing/offer-lab/funnels/:id`**
- **Description**: Update funnel content
- **Auth**: Required (JWT)
- **Request Body**: Partial funnel update

**POST `/marketing/offer-lab/funnels/:id/publish`**
- **Description**: Publish funnel to public URL
- **Auth**: Required (JWT)
- **Request Body**:
  ```json
  {
    "overrideValidation": false
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "funnel": { /* updated funnel */ },
    "publicUrl": "/f/funnel_xyz789",
    "message": "Funnel published successfully"
  }
  ```

#### Lead Capture & Management (2 endpoints)

**POST `/marketing/offer-lab/leads`** (Public - No Auth)
- **Description**: Capture lead from funnel form
- **Request Body**:
  ```json
  {
    "funnelId": "funnel_xyz789",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "utmSource": "facebook",
    "utmMedium": "cpc",
    "utmCampaign": "spring2025"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "leadId": "lead_abc123",
    "message": "Lead captured successfully"
  }
  ```

**GET `/marketing/offer-lab/leads`**
- **Description**: List captured leads
- **Auth**: Required (JWT)
- **Query Parameters**: Filters by funnel, UTM params, date range
- **Response**: Paginated leads list

#### Lead Magnet Generation (1 endpoint)

**POST `/marketing/offer-lab/lead-magnets/generate`**
- **Description**: Generate PDF lead magnet
- **Auth**: Required (JWT)
- **Request Body**:
  ```json
  {
    "title": "7-Day Weight Loss Meal Plan",
    "description": "Complete guide with recipes",
    "format": "pdf" | "html" | "doc" | "checklist",
    "content": "Optional pre-filled content",
    "offerId": "offer_abc123"
  }
  ```

#### Scraper Logs (1 endpoint)

**GET `/marketing/offer-lab/scraper-logs`**
- **Description**: View scraper execution logs
- **Auth**: Required (JWT)
- **Query Parameters**:
  - `network`: Filter by network
  - `limit`: Max results (default: 20)

---

### Phase 2: Traffic Deployment & Optimization

#### Traffic Connections (2 endpoints)

**POST `/marketing/offer-lab/traffic/connections`**
- **Description**: Create encrypted traffic network connection
- **Auth**: Required (JWT)
- **Request Body**:
  ```json
  {
    "network": "popads" | "propellerads",
    "apiKey": "your-api-key-here",
    "isSandbox": false
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "connection": {
      "id": "conn_abc123",
      "network": "popads",
      "apiKey": "***ENCRYPTED***",
      "isSandbox": false,
      "isActive": true,
      "createdAt": "2025-10-29T16:00:00Z"
    },
    "message": "Traffic connection created successfully"
  }
  ```
- **Notes**: API key is encrypted with AES-256 before storage

**GET `/marketing/offer-lab/traffic/connections`**
- **Description**: List traffic connections
- **Auth**: Required (JWT)
- **Response** (200 OK):
  ```json
  {
    "connections": [
      {
        "id": "conn_abc123",
        "network": "popads",
        "apiKey": "***ENCRYPTED***",
        "isSandbox": false,
        "isActive": true,
        "campaigns": 3,
        "createdAt": "2025-10-29T16:00:00Z"
      }
    ]
  }
  ```

#### Campaign Management (3 endpoints)

**POST `/marketing/offer-lab/campaigns/launch`**
- **Description**: Launch automated test campaign with ad variants
- **Auth**: Required (JWT)
- **Request Body**:
  ```json
  {
    "offerId": "offer_abc123",
    "funnelId": "funnel_xyz789",
    "connectionId": "conn_abc123",
    "targetGeos": ["US", "CA"],
    "dailyBudget": 10.00,
    "targetDevices": ["desktop", "mobile"]
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "campaignId": "camp_def456",
    "externalCampaignId": "popads_sandbox_1730218800000",
    "variantsCreated": 5,
    "message": "Campaign launched successfully"
  }
  ```
- **Validation**:
  - Minimum daily budget: $5 (network requirement)
  - Maximum daily budget: $1000
  - Global budget cap enforcement
  - Requires activated offer with tracking link
  - Requires published funnel

**GET `/marketing/offer-lab/campaigns`**
- **Description**: List campaigns with latest metrics
- **Auth**: Required (JWT)
- **Query Parameters**:
  - `status`: `active` | `paused` | `completed` | `error`
  - `offerId`: Filter by offer
  - `connectionId`: Filter by connection
  - `page`, `pageSize`, `sortBy`, `sortOrder`
- **Response** (200 OK):
  ```json
  {
    "campaigns": [
      {
        "id": "camp_def456",
        "name": "Premium Weight Loss - US,CA",
        "offer": {
          "id": "offer_abc123",
          "title": "Premium Weight Loss Program",
          "payout": 35.00
        },
        "funnel": {
          "id": "funnel_xyz789",
          "headline": "Transform Your Body"
        },
        "connection": {
          "id": "conn_abc123",
          "network": "popads"
        },
        "dailyBudget": 10.00,
        "totalSpent": 8.45,
        "status": "active",
        "targetGeos": ["US", "CA"],
        "launchedAt": "2025-10-29T17:00:00Z",
        "metrics": [
          {
            "impressions": 2450,
            "clicks": 18,
            "spent": 8.45,
            "conversions": 2,
            "revenue": 70.00,
            "ctr": 0.73,
            "epc": 3.89,
            "roi": 728.40,
            "recordedAt": "2025-10-29T20:00:00Z"
          }
        ]
      }
    ],
    "pagination": { /* standard pagination */ }
  }
  ```

**PATCH `/marketing/offer-lab/campaigns/:id/pause`**
- **Description**: Manually pause campaign
- **Auth**: Required (JWT)
- **Request Body**:
  ```json
  {
    "reason": "Manual pause for budget reallocation"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Campaign paused: Manual pause for budget reallocation"
  }
  ```
- **Notes**: Also pauses campaign on traffic network via adapter

#### Conversion Tracking (1 endpoint)

**POST `/marketing/offer-lab/postback`** (Public - No Auth)
- **Description**: Conversion tracking webhook from affiliate networks
- **Query Parameters**:
  - `campaign_id`: Optional campaign ID
  - `click_id`: Network click identifier
  - `lead_id`: Internal lead ID
  - `payout`: Conversion payout amount
  - `status`: `approved` | `pending` | `rejected`
  - `transaction_id`: Network transaction ID
  - `offer_id`: Optional offer ID
- **Example URL**:
  ```
  https://yourdomain.com/api/marketing/offer-lab/postback?
    lead_id={LEAD_ID}&
    click_id={CLICK_ID}&
    payout={PAYOUT}&
    status={STATUS}&
    transaction_id={TRANSACTION_ID}
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Conversion tracked successfully",
    "conversionId": "lead_abc123",
    "payout": 35.00
  }
  ```
- **Notes**:
  - Updates `FunnelLead` with conversion data
  - Recalculates campaign EPC and ROI metrics
  - No authentication required (public webhook)

---

### Auto-Pause Rules (Automated)

**Job Processor**: `AutoPauseCheckerProcessor`
**Schedule**: Every 30 minutes
**Thresholds**:

| Rule | Threshold | Action |
|------|-----------|--------|
| Low CTR | < 0.4% after 500 impressions | Auto-pause campaign |
| No Conversions | After $50 spent | Auto-pause campaign |
| Budget Exhaustion | 95% of daily budget | Auto-pause campaign |
| Low EPC | < $0.01 with 100+ clicks | Auto-pause campaign |
| Negative ROI | < -50% with $20+ spent | Auto-pause campaign |

**Example Auto-Pause Log**:
```
[AUTO-PAUSE] Campaign camp_def456: Low CTR: 0.32% (threshold: 0.4%)
Severity: high
Metrics: { ctr: 0.32, epc: 0.005, roi: -65, spent: 15.30 }
Recommendation: Test new ad creatives or adjust GEO targeting
```

---

### Metrics Sync (Automated)

**Job Processor**: `AdMetricsSyncProcessor`
**Schedule**: Every 6 hours
**Process**:

1. Fetch latest metrics from traffic networks (PopAds, PropellerAds)
2. Calculate derived metrics (CTR, EPC, ROI)
3. Store hourly snapshots in `AdMetric` table
4. Trigger auto-pause evaluation

---

### Enums & Constants

**Affiliate Networks**:
```typescript
type AffiliateNetwork =
  | 'maxbounty'    // Playwright scraper
  | 'clickbank'    // REST API
  | 'digistore24'  // Planned
  | 'cj'           // Planned
  | 'awin';        // Planned
```

**Offer Status**:
```typescript
type OfferStatus =
  | 'pending'      // Not yet activated
  | 'testing'      // Active with traffic
  | 'paused'       // Manually paused
  | 'scaling'      // High-performing, scaling budget
  | 'inactive';    // Archived
```

**Funnel Templates**:
```typescript
type FunnelTemplate =
  | 'aida-standard'  // Attention, Interest, Desire, Action
  | 'vsl-short'      // Video sales letter (3-5 min)
  | 'vsl-long'       // Video sales letter (10-20 min)
  | 'listicle'       // List-based content
  | 'case-study'     // Testimonial-driven
  | 'quiz'           // Interactive quiz funnel
  | 'comparison';    // Product comparison
```

**Traffic Networks**:
```typescript
type TrafficNetwork =
  | 'popads'         // Pop-unders, $5 min daily budget
  | 'propellerads';  // Push + pops, $5 min daily budget
```

**Campaign Status**:
```typescript
type CampaignStatus =
  | 'active'     // Running
  | 'paused'     // Manually or auto-paused
  | 'completed'  // Budget exhausted
  | 'error';     // Network error
```

**Ad Angles**:
```typescript
type AdAngle =
  | 'pain'          // Focus on problem
  | 'benefit'       // Focus on transformation
  | 'urgency'       // Time pressure
  | 'social-proof'  // FOMO-driven
  | 'scarcity';     // Limited availability
```

---

### Related Documentation

- [Use-Case Diagram](../docs/14-marketing-engine/OFFER_LAB_USE_CASE_DIAGRAM.md)
- [Phase 1 Audit](../docs/15-validations/HALLUCINATION_AUDITS/OFFER_LAB_PHASE1_AUDIT.md)
- [Phase 2 Audit](../docs/15-validations/HALLUCINATION_AUDITS/OFFER_LAB_PHASE2_AUDIT.md)
- [Phase 2 Verification](../docs/15-validations/OFFER_LAB_PHASE2_AUDIT.md)
- [Environment Variables](../.env.example.offer-lab)

---

## Error Handling

### Standard Error Response Format

All errors follow this consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional context about the error",
    "field": "fieldName",
    "timestamp": "2025-10-29T14:30:00Z",
    "requestId": "req_abc123"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 202 | Accepted | Async operation started |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |
| 502 | Bad Gateway | External service error |
| 503 | Service Unavailable | System overloaded or maintenance |

### Common Error Codes

```typescript
// Authentication Errors
UNAUTHORIZED: "No valid authentication token provided"
INVALID_TOKEN: "Authentication token is invalid or expired"
EMAIL_NOT_VERIFIED: "Please verify your email before logging in"

// Authorization Errors
FORBIDDEN: "You don't have permission to access this resource"
INSUFFICIENT_ROLE: "Your account role doesn't have access to this feature"

// Validation Errors
INVALID_INPUT: "One or more input fields are invalid"
MISSING_REQUIRED_FIELD: "Required field is missing"
INVALID_EMAIL: "Email format is invalid"
WEAK_PASSWORD: "Password doesn't meet security requirements"

// Resource Errors
NOT_FOUND: "The requested resource was not found"
ALREADY_EXISTS: "A resource with this identifier already exists"
PROFILE_NOT_FOUND: "Marketing profile not found"
CAMPAIGN_NOT_FOUND: "Campaign not found"

// Platform Errors
PLATFORM_NOT_CONNECTED: "Platform is not connected to this profile"
PLATFORM_CONNECTION_FAILED: "Failed to connect to platform"
OAUTH_ERROR: "OAuth authentication failed"
API_KEY_INVALID: "Platform API key is invalid"

// Rate Limiting
RATE_LIMIT_EXCEEDED: "You've exceeded the rate limit. Please try again later."

// External Services
EXTERNAL_API_ERROR: "External API request failed"
AI_GENERATION_FAILED: "AI content generation failed"
PLATFORM_API_ERROR: "Platform API returned an error"

// System Errors
INTERNAL_ERROR: "An unexpected error occurred"
DATABASE_ERROR: "Database operation failed"
QUEUE_ERROR: "Job queue operation failed"
```

### Example Error Responses

**400 Bad Request - Validation Error**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Validation failed",
    "details": "Email format is invalid",
    "field": "email",
    "timestamp": "2025-10-29T14:30:00Z",
    "requestId": "req_abc123"
  }
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "details": "No valid authentication token provided",
    "timestamp": "2025-10-29T14:30:00Z",
    "requestId": "req_def456"
  }
}
```

**429 Rate Limit Exceeded**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "details": "You've made 100 requests in the last hour. Limit is 100/hour.",
    "retryAfter": 3600,
    "limit": 100,
    "remaining": 0,
    "resetAt": "2025-10-29T15:30:00Z",
    "timestamp": "2025-10-29T14:30:00Z",
    "requestId": "req_ghi789"
  }
}
```

---

## Rate Limiting

### Rate Limits by Plan

| Plan | Requests/Hour | Requests/Day | Concurrent Jobs |
|------|---------------|--------------|-----------------|
| **Free** | 100 | 1,000 | 2 |
| **Starter** | 500 | 10,000 | 5 |
| **Professional** | 2,000 | 50,000 | 10 |
| **Enterprise** | 10,000 | 500,000 | 50 |

### Rate Limit Headers

All responses include rate limit information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1730207400
X-RateLimit-Reset-ISO: 2025-10-29T15:30:00Z
```

### Rate Limit Best Practices

1. **Respect rate limits**: Check `X-RateLimit-Remaining` before making requests
2. **Handle 429 errors**: Implement exponential backoff when rate limited
3. **Use webhooks**: Subscribe to events instead of polling
4. **Batch requests**: Use batch endpoints where available
5. **Cache responses**: Don't repeatedly request the same data

---

## Webhooks

### Coming Soon

Webhook functionality for real-time event notifications is planned for a future release.

**Planned Events**:
- `campaign.created`
- `campaign.started`
- `campaign.completed`
- `content.published`
- `content.failed`
- `trend.detected`
- `platform.disconnected`
- `analytics.updated`

---

## SDK Usage Examples

### JavaScript/TypeScript SDK

```typescript
import { MarketingEngineSDK } from '@dryjets/marketing-sdk';

// Initialize SDK
const sdk = new MarketingEngineSDK({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.dryjets.com'
});

// Create a profile
const profile = await sdk.profiles.create({
  name: 'My SaaS Company',
  brandVoice: 'professional',
  industry: 'Software',
  goals: ['brand_awareness', 'lead_generation']
});

// Connect Twitter
const connection = await sdk.platforms.connect(profile.id, {
  platform: 'twitter',
  authType: 'oauth',
  redirectUrl: 'https://yourapp.com/callback'
});

// Create autonomous campaign
const campaign = await sdk.campaigns.create({
  name: 'Q4 Launch',
  profileId: profile.id,
  type: 'MULTI_CHANNEL',
  mode: 'autonomous',
  platforms: ['twitter', 'linkedin'],
  budget: 10000,
  startDate: new Date('2025-11-01'),
  endDate: new Date('2025-12-31')
});

// Analyze trends
await sdk.campaigns.analyzeTrends(campaign.id);

// Wait for trends (polling)
const trends = await sdk.campaigns.waitForTrends(campaign.id, {
  timeout: 300000, // 5 minutes
  interval: 5000   // Check every 5 seconds
});

// Generate content
await sdk.campaigns.orchestrate(campaign.id);

// Approve and start
await sdk.campaigns.approve(campaign.id);
await sdk.campaigns.start(campaign.id);

// Monitor analytics
const analytics = await sdk.analytics.getCampaign(campaign.id);
console.log('Campaign Performance:', analytics.performance);
```

---

## Integration Guides

### OAuth Integration Flow

#### Step 1: Initiate OAuth
Redirect user to OAuth initiation endpoint:

```typescript
const profileId = 'profile_abc123';
const platform = 'twitter';
const redirectUrl = `https://api.dryjets.com/marketing/profile/${profileId}/connections/${platform}/oauth/initiate`;

window.location.href = redirectUrl;
```

#### Step 2: User Authorizes
User is redirected to platform's OAuth page (e.g., Twitter) and authorizes access.

#### Step 3: Callback Handling
Platform redirects back to our OAuth callback:

```
GET https://api.dryjets.com/marketing/profile/{profileId}/connections/{platform}/oauth/callback?code=xxx&state=yyy
```

#### Step 4: Frontend Redirect
Our backend processes the callback and redirects to your frontend:

```
302 https://yourapp.com/profile/{profileId}?connection=success&platform=twitter
```

#### Step 5: Verify Connection
Check connection status:

```typescript
const connections = await fetch(
  `https://api.dryjets.com/marketing/profile/${profileId}/connections`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
).then(res => res.json());

const twitterConnection = connections.data.connections.find(
  c => c.platform === 'twitter'
);

if (twitterConnection.status === 'connected') {
  console.log('Twitter connected successfully!');
}
```

---

## Database Schema

### Core Marketing Models

```prisma
// User Authentication
model User {
  id            String     @id @default(cuid())
  email         String     @unique
  passwordHash  String
  firstName     String?
  lastName      String?
  role          UserRole
  status        UserStatus @default(PENDING_VERIFICATION)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}

// Marketing Profile
model MarketingProfile {
  id               String   @id @default(cuid())
  userId           String
  name             String
  brandVoice       String
  industry         String
  targetAudience   Json
  goals            Json
  status           String   @default("ACTIVE")
  completeness     Int      @default(0)
  platforms        Json
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

// Campaign
model Campaign {
  id             String         @id @default(cuid())
  name           String
  profileId      String
  type           CampaignType
  status         CampaignStatus @default(DRAFT)
  objective      String
  platforms      Json
  budget         Decimal
  spent          Decimal        @default(0)
  startDate      DateTime
  endDate        DateTime?
  targetAudience Json
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
}

// Campaign Content
model CampaignContent {
  id          String   @id @default(cuid())
  campaignId  String
  platform    String
  contentType String
  content     Json
  status      String   @default("DRAFT")
  scheduledFor DateTime?
  publishedAt  DateTime?
  createdAt   DateTime @default(now())
}

// Campaign Metrics
model CampaignMetric {
  id          String   @id @default(cuid())
  campaignId  String
  date        DateTime @db.Date
  platform    String?
  impressions Int      @default(0)
  clicks      Int      @default(0)
  engagement  Int      @default(0)
  conversions Int      @default(0)
  spend       Decimal  @default(0)
  revenue     Decimal  @default(0)
}

// Blog Post
model BlogPost {
  id              String         @id @default(cuid())
  title           String
  slug            String         @unique
  content         String         @db.Text
  excerpt         String?
  status          BlogPostStatus @default(DRAFT)
  publishedAt     DateTime?
  metaTitle       String?
  metaDescription String?
  keywords        String[]
  createdAt       DateTime       @default(now())
}

// Content Asset
model ContentAsset {
  id           String           @id @default(cuid())
  profileId    String?
  platform     String
  type         ContentAssetType
  content      String           @db.Text
  metadata     Json?
  status       String           @default("DRAFT")
  scheduledFor DateTime?
  publishedAt  DateTime?
  createdAt    DateTime         @default(now())
}

// Trend Data
model TrendData {
  id               String         @id @default(cuid())
  source           String
  keyword          String
  volume           Int
  growth           Decimal        @db.Decimal(5, 2)
  lifecycle        TrendLifecycle
  viralCoefficient Decimal?       @db.Decimal(5, 2)
  sentiment        Decimal?       @db.Decimal(3, 2)
  relevanceScore   Int
  capturedAt       DateTime       @default(now())
}

// Keyword
model Keyword {
  id              String        @id @default(cuid())
  keyword         String        @unique
  searchVolume    Int
  difficulty      Int
  cpc             Decimal?
  intent          KeywordIntent
  category        String
  currentRank     Int?
  featuredSnippet Boolean       @default(false)
}

// Video DNA
model VideoDNA {
  id              String @id @default(cuid())
  profileId       String
  name            String
  colorPalette    Json
  visualStyle     Json
  characters      Json[]
  sceneTemplates  Json[]
  audioSignature  Json
  minQualityScore Int    @default(85)
}
```

---

## Changelog

### Version 1.0.0 (2025-10-29)
- Initial API documentation release
- Documented 337+ endpoints across 12 controllers
- Comprehensive authentication, profile, campaign, content, trend, SEO, video, publishing, analytics, intelligence, ML, workflow, optimization, and monitoring APIs
- Added error handling, rate limiting, and SDK examples
- Included integration guides and database schema

---

## Support & Feedback

### Documentation
- **GitHub**: https://github.com/husamdaifalla01-cmyk/DryJets
- **Issues**: https://github.com/husamdaifalla01-cmyk/DryJets/issues

### API Status
- **Status Page**: https://status.dryjets.com (planned)
- **Uptime Monitor**: 99.9% SLA target

### Contact
- **Email**: support@dryjets.com
- **Discord**: https://discord.gg/dryjets (planned)

---

## Legal

### Terms of Service
By using the Marketing Workflow Engine API, you agree to our Terms of Service.

### Privacy Policy
See our Privacy Policy for how we handle your data.

### License
Proprietary - All rights reserved

---

**© 2025 DryJets. All rights reserved.**

*Generated on: 2025-10-29*
*API Version: 1.0.0*
*Documentation Version: 1.0.0*
