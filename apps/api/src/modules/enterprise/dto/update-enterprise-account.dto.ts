import { PartialType } from '@nestjs/swagger';
import { CreateEnterpriseAccountDto } from './create-enterprise-account.dto';

export class UpdateEnterpriseAccountDto extends PartialType(CreateEnterpriseAccountDto) {}
