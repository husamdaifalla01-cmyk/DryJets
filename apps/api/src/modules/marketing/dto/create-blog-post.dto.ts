import { IsString, IsOptional, IsArray, IsBoolean, IsObject } from 'class-validator';

export class CreateBlogPostDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsArray()
  @IsOptional()
  keywords?: string[];

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsBoolean()
  @IsOptional()
  aiGenerated?: boolean;

  @IsObject()
  @IsOptional()
  aiBrief?: any;

  @IsString()
  @IsOptional()
  createdBy?: string;
}
