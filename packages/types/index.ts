/**
 * DryJets Platform - Shared Types
 *
 * @description Central export for all TypeScript types across the monorepo
 * @usage
 *   // Types
 *   import type { MarketingProfile, Campaign, Content } from '@dryjets/types'
 *   // DTOs
 *   import { CreateProfileDto, UpdateProfileDto } from '@dryjets/types/dtos'
 */

// Core platform types
export * from './src/user.types';
export * from './src/order.types';

// Marketing domain types
export * from './src/marketing';

// Marketing DTOs (Data Transfer Objects)
export * from './src/dtos';
