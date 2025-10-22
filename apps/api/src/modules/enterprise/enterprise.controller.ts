import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EnterpriseService } from './enterprise.service';
import {
  CreateEnterpriseAccountDto,
  UpdateEnterpriseAccountDto,
  CreateBranchDto,
  UpdateBranchDto,
} from './dto';
// import { EnterpriseAccount } from '../../common/decorators/enterprise-account.decorator';

/**
 * Enterprise Controller
 *
 * Protected routes automatically receive tenant context via ApiKeyMiddleware.
 * To access the authenticated enterprise account in a route handler, use the @EnterpriseAccount() decorator:
 *
 * @example
 * ```typescript
 * @Get('my-branches')
 * async getMyBranches(@EnterpriseAccount() account: any) {
 *   // account contains { id, name, tenantId, userId, subscriptionPlan, monthlyQuota }
 *   return this.enterpriseService.getBranches(account.id);
 * }
 * ```
 */

@ApiTags('enterprise')
@Controller('enterprise')
export class EnterpriseController {
  constructor(private readonly enterpriseService: EnterpriseService) {}

  // ===== Enterprise Account Management =====

  @Post()
  @ApiOperation({ summary: 'Create a new enterprise account' })
  @ApiResponse({ status: 201, description: 'Enterprise account created successfully' })
  @ApiResponse({ status: 409, description: 'User already has an enterprise account' })
  create(@Body() createDto: CreateEnterpriseAccountDto) {
    return this.enterpriseService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all enterprise accounts (admin only)' })
  @ApiResponse({ status: 200, description: 'List of enterprise accounts' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.enterpriseService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('by-user/:userId')
  @ApiOperation({ summary: 'Get enterprise account by user ID' })
  @ApiResponse({ status: 200, description: 'Enterprise account found' })
  @ApiResponse({ status: 404, description: 'Enterprise account not found' })
  findByUserId(@Param('userId') userId: string) {
    return this.enterpriseService.findByUserId(userId);
  }

  @Get('by-tenant/:tenantId')
  @ApiOperation({ summary: 'Get enterprise account by tenant ID' })
  @ApiResponse({ status: 200, description: 'Enterprise account found' })
  @ApiResponse({ status: 404, description: 'Enterprise account not found' })
  findByTenantId(@Param('tenantId') tenantId: string) {
    return this.enterpriseService.findByTenantId(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get enterprise account by ID' })
  @ApiResponse({ status: 200, description: 'Enterprise account found' })
  @ApiResponse({ status: 404, description: 'Enterprise account not found' })
  findOne(@Param('id') id: string) {
    return this.enterpriseService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update enterprise account' })
  @ApiResponse({ status: 200, description: 'Enterprise account updated successfully' })
  @ApiResponse({ status: 404, description: 'Enterprise account not found' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEnterpriseAccountDto,
  ) {
    return this.enterpriseService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete enterprise account' })
  @ApiResponse({ status: 204, description: 'Enterprise account deleted successfully' })
  @ApiResponse({ status: 404, description: 'Enterprise account not found' })
  remove(@Param('id') id: string) {
    return this.enterpriseService.remove(id);
  }

  // ===== API Key Management =====

  @Post(':id/api-key/regenerate')
  @ApiOperation({ summary: 'Regenerate API key' })
  @ApiResponse({ status: 200, description: 'API key regenerated successfully' })
  regenerateApiKey(@Param('id') id: string) {
    return this.enterpriseService.regenerateApiKey(id);
  }

  @Patch(':id/api-key/toggle')
  @ApiOperation({ summary: 'Enable/disable API access' })
  @ApiResponse({ status: 200, description: 'API access toggled successfully' })
  toggleApiAccess(
    @Param('id') id: string,
    @Body('enabled') enabled: boolean,
  ) {
    return this.enterpriseService.toggleApiAccess(id, enabled);
  }

  @Post('validate-api-key')
  @ApiOperation({ summary: 'Validate API key' })
  @ApiResponse({ status: 200, description: 'API key validation result' })
  validateApiKey(@Body('apiKey') apiKey: string) {
    return this.enterpriseService.validateApiKey(apiKey);
  }

  // ===== Branch Management =====

  @Post(':id/branches')
  @ApiOperation({ summary: 'Create a new branch' })
  @ApiResponse({ status: 201, description: 'Branch created successfully' })
  @ApiResponse({ status: 400, description: 'Branch limit reached' })
  @ApiResponse({ status: 409, description: 'Branch code already exists' })
  createBranch(@Body() createDto: CreateBranchDto) {
    return this.enterpriseService.createBranch(createDto);
  }

  @Get(':id/branches')
  @ApiOperation({ summary: 'Get branches for an organization' })
  @ApiResponse({ status: 200, description: 'List of branches' })
  getBranches(
    @Param('id') organizationId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.enterpriseService.getBranches(
      organizationId,
      activeOnly !== 'false',
    );
  }

  @Get('branches/:branchId')
  @ApiOperation({ summary: 'Get branch by ID' })
  @ApiResponse({ status: 200, description: 'Branch found' })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  getBranch(@Param('branchId') branchId: string) {
    return this.enterpriseService.getBranch(branchId);
  }

  @Patch('branches/:branchId')
  @ApiOperation({ summary: 'Update branch' })
  @ApiResponse({ status: 200, description: 'Branch updated successfully' })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  updateBranch(
    @Param('branchId') branchId: string,
    @Body() updateDto: UpdateBranchDto,
  ) {
    return this.enterpriseService.updateBranch(branchId, updateDto);
  }

  @Post('branches/:branchId/deactivate')
  @ApiOperation({ summary: 'Deactivate branch' })
  @ApiResponse({ status: 200, description: 'Branch deactivated successfully' })
  deactivateBranch(@Param('branchId') branchId: string) {
    return this.enterpriseService.deactivateBranch(branchId);
  }

  @Delete('branches/:branchId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete branch' })
  @ApiResponse({ status: 204, description: 'Branch deleted successfully' })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  deleteBranch(@Param('branchId') branchId: string) {
    return this.enterpriseService.deleteBranch(branchId);
  }

  // ===== Quota & Usage =====

  @Get(':id/quota')
  @ApiOperation({ summary: 'Check monthly quota usage' })
  @ApiResponse({ status: 200, description: 'Quota information' })
  checkQuota(@Param('id') organizationId: string) {
    return this.enterpriseService.checkQuota(organizationId);
  }

  @Get(':id/api-logs')
  @ApiOperation({ summary: 'Get API usage logs' })
  @ApiResponse({ status: 200, description: 'API usage logs' })
  getApiLogs(
    @Param('id') organizationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.enterpriseService.getApiLogs(
      organizationId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }
}
