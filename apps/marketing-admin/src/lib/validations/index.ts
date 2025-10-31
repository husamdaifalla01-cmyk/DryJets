/**
 * VALIDATION SCHEMAS - INDEX
 *
 * Central export for all Zod validation schemas.
 * These schemas provide runtime type validation and integrate with react-hook-form.
 *
 * @usage
 * import { createProfileSchema, CreateProfileFormData } from '@/lib/validations'
 * import { zodResolver } from '@hookform/resolvers/zod'
 * import { useForm } from 'react-hook-form'
 *
 * const form = useForm<CreateProfileFormData>({
 *   resolver: zodResolver(createProfileSchema),
 *   defaultValues: { ... }
 * })
 */

// Profile schemas
export * from './profile.schema';

// Platform connection schemas
export * from './platform.schema';

// Campaign schemas
export * from './campaign.schema';

// Content schemas
export * from './content.schema';

// SEO schemas
export * from './seo.schema';

// Analytics schemas
export * from './analytics.schema';
