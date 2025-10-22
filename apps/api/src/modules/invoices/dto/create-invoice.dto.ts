import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELED = 'CANCELED',
}

export class InvoiceLineItemDto {
  @ApiProperty({ example: 'Dry cleaning services - January 2025' })
  @IsString()
  description: string;

  @ApiProperty({ example: 25 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 15.99 })
  @IsNumber()
  unitPrice: number;

  @ApiProperty({ example: 399.75 })
  @IsNumber()
  total: number;

  @ApiPropertyOptional({ example: 'order123' })
  @IsString()
  @IsOptional()
  orderId?: string;
}

export class CreateInvoiceDto {
  @ApiProperty({ example: 'INV-2025-001' })
  @IsString()
  invoiceNumber: string;

  @ApiPropertyOptional({ example: 'business123' })
  @IsString()
  @IsOptional()
  businessId?: string;

  @ApiPropertyOptional({ example: 'org123' })
  @IsString()
  @IsOptional()
  organizationId?: string;

  @ApiProperty({ example: 399.75 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: 39.98, default: 0 })
  @IsNumber()
  @IsOptional()
  tax?: number;

  @ApiProperty({ example: 439.73 })
  @IsNumber()
  total: number;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ enum: InvoiceStatus, default: InvoiceStatus.PENDING })
  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @ApiProperty({ example: '2025-11-22T00:00:00Z' })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({ example: 'Thank you for your business' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ type: [InvoiceLineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  lineItems: InvoiceLineItemDto[];
}
