'use client';

/**
 * Design System Showcase
 * "Precision OS" v2.0 Components
 *
 * This page demonstrates all new v2 components in various states
 * Use this as a reference for implementing the new design system
 */

import * as React from 'react';
import { Button } from '@/components/ui/button-v2';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardDivider,
} from '@/components/ui/card-v2';
import { Badge } from '@/components/ui/badge-v2';
import {
  Input,
  Textarea,
  Label,
  HelperText,
  ErrorText,
  FormField,
} from '@/components/ui/input-v2';
import {
  Save,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  Mail,
  Lock,
  ArrowRight,
  Plus,
  TrendingUp,
  Activity,
  Zap,
} from 'lucide-react';

export default function DesignSystemPage() {
  const [inputValue, setInputValue] = React.useState('');
  const [hasError, setHasError] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0A0A0B] py-12 px-6">
      <div className="max-w-[1200px] mx-auto space-y-12">
        {/* Page Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h1 className="text-5xl font-bold text-[#111827] dark:text-[#FAFAFA] tracking-tight">
              Design System
            </h1>
            <Badge variant="accent" size="md">
              v2.0
            </Badge>
          </div>
          <p className="text-lg text-[#6B7280] dark:text-[#A1A1A6] max-w-3xl">
            "Precision OS" — World-class enterprise components designed for speed, clarity, and
            polish. Every component is crafted to feel premium, accessible, and authentically
            DryJets.
          </p>
        </div>

        {/* Buttons Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#111827] dark:text-[#FAFAFA] mb-2">
              Buttons
            </h2>
            <p className="text-sm text-[#6B7280] dark:text-[#A1A1A6]">
              Clean, solid colors. No gradients. Fast hover lift. Focus rings for accessibility.
            </p>
          </div>

          <Card padding="spacious">
            <div className="space-y-8">
              {/* Primary Buttons */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#374151] dark:text-[#FAFAFA] uppercase tracking-wide">
                  Primary Variants
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" size="lg">
                    Save Changes
                  </Button>
                  <Button variant="primary" size="md">
                    Save Changes
                  </Button>
                  <Button variant="primary" size="sm">
                    Save Changes
                  </Button>
                  <Button variant="primary" size="xs">
                    Save Changes
                  </Button>
                </div>
              </div>

              {/* All Variants */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#374151] dark:text-[#FAFAFA] uppercase tracking-wide">
                  All Variants
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" iconBefore={<Save className="h-4 w-4" />}>
                    Primary
                  </Button>
                  <Button variant="secondary" iconBefore={<Download className="h-4 w-4" />}>
                    Secondary
                  </Button>
                  <Button variant="ghost" iconBefore={<ArrowRight className="h-4 w-4" />}>
                    Ghost
                  </Button>
                  <Button variant="outline" iconBefore={<Plus className="h-4 w-4" />}>
                    Outline
                  </Button>
                  <Button variant="success" iconBefore={<CheckCircle2 className="h-4 w-4" />}>
                    Success
                  </Button>
                  <Button variant="danger" iconBefore={<Trash2 className="h-4 w-4" />}>
                    Danger
                  </Button>
                  <Button variant="link">Link Button</Button>
                </div>
              </div>

              {/* Button States */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#374151] dark:text-[#FAFAFA] uppercase tracking-wide">
                  States
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" loading>
                    Loading
                  </Button>
                  <Button variant="primary" disabled>
                    Disabled
                  </Button>
                  <Button variant="primary" iconAfter={<ArrowRight className="h-4 w-4" />}>
                    Icon After
                  </Button>
                  <Button variant="primary" fullWidth>
                    Full Width
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Cards Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#111827] dark:text-[#FAFAFA] mb-2">
              Cards
            </h2>
            <p className="text-sm text-[#6B7280] dark:text-[#A1A1A6]">
              Light backgrounds, subtle borders, smooth hover transitions. Compound components for
              flexibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Default Card */}
            <Card variant="default" padding="default">
              <CardHeader>
                <CardTitle size="md">Default Card</CardTitle>
                <CardDescription>Light background with subtle border</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#6B7280] dark:text-[#A1A1A6]">
                  This is the default card style with a 1px border and subtle shadow.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="primary" size="sm">
                  Learn More
                </Button>
              </CardFooter>
            </Card>

            {/* Elevated Card */}
            <Card variant="elevated" padding="default">
              <CardHeader>
                <CardTitle size="md">Elevated Card</CardTitle>
                <CardDescription>No border, more shadow for depth</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#6B7280] dark:text-[#A1A1A6]">
                  Elevated cards float above the surface with a larger shadow.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" size="sm">
                  View Details
                </Button>
              </CardFooter>
            </Card>

            {/* Interactive Card */}
            <Card variant="interactive" padding="default">
              <CardHeader>
                <CardTitle size="md">Interactive Card</CardTitle>
                <CardDescription>Hover me for lift effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#6B7280] dark:text-[#A1A1A6]">
                  Interactive cards have smooth hover transitions and cursor pointer.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" iconAfter={<ArrowRight className="h-4 w-4" />}>
                  Open
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Card with Dividers */}
          <Card variant="default" padding="spacious">
            <CardHeader noPadding>
              <CardTitle size="lg">Analytics Overview</CardTitle>
              <CardDescription>Weekly performance metrics</CardDescription>
            </CardHeader>

            <CardDivider />

            <CardContent noPadding>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#6B7280] dark:text-[#A1A1A6] text-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span>Revenue</span>
                  </div>
                  <p className="text-3xl font-bold text-[#111827] dark:text-[#FAFAFA]">$12,450</p>
                  <p className="text-xs text-[#00A86B]">↑ 12.5%</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#6B7280] dark:text-[#A1A1A6] text-sm">
                    <Activity className="h-4 w-4" />
                    <span>Orders</span>
                  </div>
                  <p className="text-3xl font-bold text-[#111827] dark:text-[#FAFAFA]">142</p>
                  <p className="text-xs text-[#FF3B30]">↓ 5.2%</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#6B7280] dark:text-[#A1A1A6] text-sm">
                    <Zap className="h-4 w-4" />
                    <span>Efficiency</span>
                  </div>
                  <p className="text-3xl font-bold text-[#111827] dark:text-[#FAFAFA]">94%</p>
                  <p className="text-xs text-[#00A86B]">↑ 3.1%</p>
                </div>
              </div>
            </CardContent>

            <CardDivider />

            <CardFooter noPadding className="justify-between">
              <p className="text-sm text-[#6B7280] dark:text-[#A1A1A6]">Last updated: 2 min ago</p>
              <Button variant="ghost" size="sm" iconAfter={<ArrowRight className="h-4 w-4" />}>
                View Full Report
              </Button>
            </CardFooter>
          </Card>
        </section>

        {/* Badges Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#111827] dark:text-[#FAFAFA] mb-2">
              Badges
            </h2>
            <p className="text-sm text-[#6B7280] dark:text-[#A1A1A6]">
              Subtle backgrounds, clean design. Use sparingly.
            </p>
          </div>

          <Card padding="spacious">
            <div className="space-y-8">
              {/* Badge Variants */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#374151] dark:text-[#FAFAFA] uppercase tracking-wide">
                  Variants
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="danger">Danger</Badge>
                  <Badge variant="accent">Premium</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </div>

              {/* Badge Sizes */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#374151] dark:text-[#FAFAFA] uppercase tracking-wide">
                  Sizes
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="primary" size="sm">
                    Small
                  </Badge>
                  <Badge variant="primary" size="md">
                    Medium
                  </Badge>
                </div>
              </div>

              {/* Badge with Dots */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#374151] dark:text-[#FAFAFA] uppercase tracking-wide">
                  With Status Dots
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success" showDot>
                    Online
                  </Badge>
                  <Badge variant="primary" showDot>
                    Processing
                  </Badge>
                  <Badge variant="warning" showDot>
                    Pending
                  </Badge>
                  <Badge variant="danger" showDot>
                    Offline
                  </Badge>
                  <Badge variant="default" showDot>
                    Inactive
                  </Badge>
                </div>
              </div>

              {/* Pill Badges */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#374151] dark:text-[#FAFAFA] uppercase tracking-wide">
                  Pill Shape
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="primary" pill>
                    New
                  </Badge>
                  <Badge variant="success" pill>
                    Verified
                  </Badge>
                  <Badge variant="accent" pill>
                    Pro
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Forms Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#111827] dark:text-[#FAFAFA] mb-2">
              Form Inputs
            </h2>
            <p className="text-sm text-[#6B7280] dark:text-[#A1A1A6]">
              Clean, accessible form inputs with focus rings and validation states.
            </p>
          </div>

          <Card padding="spacious">
            <div className="space-y-8 max-w-2xl">
              {/* Basic Input */}
              <FormField
                label="Email Address"
                required
                helperText="We'll never share your email with anyone else."
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  iconBefore={<Mail className="h-4 w-4" />}
                />
              </FormField>

              {/* Input with Error */}
              <FormField
                label="Password"
                required
                error={hasError ? 'Password must be at least 8 characters' : undefined}
              >
                <Input
                  type="password"
                  placeholder="Enter your password"
                  variant={hasError ? 'error' : 'default'}
                  iconBefore={<Lock className="h-4 w-4" />}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setHasError(e.target.value.length > 0 && e.target.value.length < 8);
                  }}
                />
              </FormField>

              {/* Input Sizes */}
              <div className="space-y-3">
                <Label>Input Sizes</Label>
                <div className="space-y-2">
                  <Input inputSize="sm" placeholder="Small (32px)" />
                  <Input inputSize="md" placeholder="Medium (36px) - Default" />
                  <Input inputSize="lg" placeholder="Large (40px)" />
                </div>
              </div>

              {/* Search Input */}
              <FormField label="Search" helperText="Search by order number, customer name, or email">
                <Input
                  type="text"
                  placeholder="Type to search..."
                  iconBefore={<Search className="h-4 w-4" />}
                />
              </FormField>

              {/* Textarea */}
              <FormField label="Description" helperText="Provide additional details (optional)">
                <Textarea placeholder="Enter description..." rows={4} />
              </FormField>

              {/* Success State */}
              <FormField label="Verification Code" helperText="Code verified successfully">
                <Input
                  type="text"
                  placeholder="000000"
                  variant="success"
                  value="123456"
                  readOnly
                  iconAfter={<CheckCircle2 className="h-4 w-4 text-[#00A86B]" />}
                />
              </FormField>

              {/* Disabled Input */}
              <FormField label="Disabled Input">
                <Input type="text" placeholder="This input is disabled" disabled />
              </FormField>
            </div>
          </Card>
        </section>

        {/* Design Principles */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#111827] dark:text-[#FAFAFA] mb-2">
              Design Principles
            </h2>
            <p className="text-sm text-[#6B7280] dark:text-[#A1A1A6]">
              Core values that guide every design decision
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="elevated" padding="default">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-[#0066FF]/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-[#0066FF]" />
                  </div>
                  <CardTitle size="md">Precision Over Flash</CardTitle>
                </div>
                <CardDescription>
                  No gratuitous gradients or neon glows. Every pixel serves a purpose. Whitespace is
                  a design element.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card variant="elevated" padding="default">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-[#00A86B]/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-[#00A86B]" />
                  </div>
                  <CardTitle size="md">Fast & Responsive</CardTitle>
                </div>
                <CardDescription>
                  Animations are 150-200ms. Every interaction feels instant. 60fps or nothing.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card variant="elevated" padding="default">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-[#6366F1]/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-[#6366F1]" />
                  </div>
                  <CardTitle size="md">Enterprise Polish</CardTitle>
                </div>
                <CardDescription>
                  Feels like a $50k/year tool. Professional, confident, timeless. Not playful.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card variant="elevated" padding="default">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-[#FF9500]/10 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-[#FF9500]" />
                  </div>
                  <CardTitle size="md">Authentic Brand</CardTitle>
                </div>
                <CardDescription>
                  Not a Linear clone. Not a Stripe clone. Unmistakably DryJets. Original identity.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <Card variant="default" padding="default">
          <div className="text-center space-y-2">
            <p className="text-sm text-[#6B7280] dark:text-[#A1A1A6]">
              Design System v2.0 — "Precision OS"
            </p>
            <p className="text-xs text-[#9CA3AF] dark:text-[#636366]">
              Built with precision, designed for enterprise, crafted with care.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
