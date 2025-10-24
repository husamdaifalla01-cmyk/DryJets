import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean, IsArray, IsObject } from 'class-validator';

export enum CampaignTypeEnum {
  AWARENESS = 'AWARENESS',
  ENGAGEMENT = 'ENGAGEMENT',
  CONVERSION = 'CONVERSION',
  RETENTION = 'RETENTION',
}

export class CreateCampaignDto {
  @IsString()
  name: string;

  @IsEnum(CampaignTypeEnum)
  type: CampaignTypeEnum;

  @IsArray()
  @IsOptional()
  platforms?: string[];

  @IsNumber()
  @IsOptional()
  budgetTotal?: number;

  @IsObject()
  @IsOptional()
  targetAudience?: any;

  @IsBoolean()
  @IsOptional()
  aiGenerated?: boolean;

  @IsString()
  @IsOptional()
  aiAgent?: string;
}
