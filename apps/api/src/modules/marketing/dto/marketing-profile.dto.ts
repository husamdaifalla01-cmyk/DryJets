import { IsString, IsNumber, IsOptional, IsArray, IsObject, Min } from 'class-validator';

export class CreateMarketingProfileDto {
  @IsString()
  name: string;

  @IsString()
  industry: string;

  @IsString()
  targetAudience: string;

  @IsString()
  primaryGoal: string;

  @IsNumber()
  @Min(0)
  monthlyBudget: number;

  @IsOptional()
  @IsString()
  brandVoice?: string;

  @IsOptional()
  @IsString()
  geographicFocus?: string;

  @IsOptional()
  @IsArray()
  competitorUrls?: string[];

  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @IsOptional()
  @IsObject()
  socialProfiles?: any;

  @IsOptional()
  @IsString()
  productDescription?: string;

  @IsOptional()
  @IsString()
  valueProposition?: string;

  @IsOptional()
  @IsObject()
  contentPreferences?: any;

  @IsOptional()
  @IsObject()
  publishingFrequency?: any;

  @IsOptional()
  @IsObject()
  brandGuidelines?: any;

  @IsOptional()
  @IsArray()
  complianceRequirements?: string[];
}

export class UpdateMarketingProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  targetAudience?: string;

  @IsOptional()
  @IsString()
  primaryGoal?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyBudget?: number;

  @IsOptional()
  @IsString()
  brandVoice?: string;

  @IsOptional()
  @IsString()
  geographicFocus?: string;

  @IsOptional()
  @IsArray()
  competitorUrls?: string[];

  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @IsOptional()
  @IsObject()
  socialProfiles?: any;

  @IsOptional()
  @IsString()
  productDescription?: string;

  @IsOptional()
  @IsString()
  valueProposition?: string;

  @IsOptional()
  @IsObject()
  contentPreferences?: any;

  @IsOptional()
  @IsObject()
  publishingFrequency?: any;

  @IsOptional()
  @IsObject()
  brandGuidelines?: any;

  @IsOptional()
  @IsArray()
  complianceRequirements?: string[];

  @IsOptional()
  @IsString()
  status?: 'draft' | 'active' | 'paused' | 'archived'; // FIX: Use union type to match Prisma schema
}

export class ConnectPlatformDto {
  @IsString()
  platform: string;

  @IsString()
  redirectUri: string;
}

export class CompleteOAuthDto {
  @IsString()
  platform: string;

  @IsString()
  code: string;

  @IsString()
  redirectUri: string;
}

export class ConnectApiKeyDto {
  @IsString()
  platform: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  apiSecret?: string;

  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsObject()
  config?: any;
}
