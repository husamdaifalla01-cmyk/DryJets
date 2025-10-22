import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty({ example: 'org123' })
  @IsString()
  organizationId: string;

  @ApiProperty({ example: 'Downtown Location' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'DT-01' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: '123 Main St, Suite 100' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'Ottawa' })
  @IsString()
  city: string;

  @ApiPropertyOptional({ example: 'ON' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: 'K1A 0B1' })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional({ example: 'USA', default: 'USA' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: '+1-613-555-0100' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'manager123' })
  @IsString()
  @IsOptional()
  managerId?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
