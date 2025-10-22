import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, IsInt, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SubscriptionPlan {
  STARTUP = 'STARTUP',      // 1-5 locations
  GROWTH = 'GROWTH',        // 6-20 locations
  ENTERPRISE = 'ENTERPRISE', // 21+ locations
  CUSTOM = 'CUSTOM',        // Custom pricing
}

export class CreateEnterpriseAccountDto {
  @ApiProperty({ example: 'user123' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'Hotel Chain International' })
  @IsString()
  name: string;

  @ApiProperty({ enum: SubscriptionPlan, default: SubscriptionPlan.STARTUP })
  @IsEnum(SubscriptionPlan)
  @IsOptional()
  subscriptionPlan?: SubscriptionPlan;

  @ApiProperty({ example: 'billing@hotelchain.com' })
  @IsEmail()
  billingEmail: string;

  @ApiPropertyOptional({ example: '2025-01-01T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  contractStart?: string;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  contractEnd?: string;

  @ApiPropertyOptional({ example: 1000 })
  @IsInt()
  @IsOptional()
  monthlyQuota?: number;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  apiKeyEnabled?: boolean;
}
