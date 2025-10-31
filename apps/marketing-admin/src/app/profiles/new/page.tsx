'use client';

import React from 'react';
import { ProfileWizardValidated } from '@/components/profiles/ProfileWizardValidated';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * NEW PROFILE PAGE
 *
 * Page for creating a new marketing profile using the validated wizard.
 * Features full Zod validation and type safety.
 */

export default function NewProfilePage() {
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/profiles"
        className="inline-flex items-center gap-2 text-text-tertiary hover:text-neon-cyan transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        BACK TO PROFILES
      </Link>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gradient-cyan mb-2">
          CREATE MARKETING PROFILE
        </h1>
        <p className="text-text-tertiary">
          Set up a new marketing profile in 5 simple steps with full validation
        </p>
      </div>

      {/* Validated Wizard */}
      <ProfileWizardValidated />
    </div>
  );
}
