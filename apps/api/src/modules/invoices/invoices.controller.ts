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
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto, InvoiceStatus } from './dto';

@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  create(@Body() createDto: CreateInvoiceDto) {
    return this.invoicesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices with optional filtering' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: InvoiceStatus })
  @ApiQuery({ name: 'businessId', required: false })
  @ApiQuery({ name: 'organizationId', required: false })
  @ApiResponse({ status: 200, description: 'List of invoices' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: InvoiceStatus,
    @Query('businessId') businessId?: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.invoicesService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      status,
      businessId,
      organizationId,
    );
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue invoices' })
  @ApiResponse({ status: 200, description: 'List of overdue invoices' })
  findOverdue(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.invoicesService.findOverdue(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get invoice statistics' })
  @ApiQuery({ name: 'businessId', required: false })
  @ApiQuery({ name: 'organizationId', required: false })
  @ApiResponse({ status: 200, description: 'Invoice statistics' })
  getStats(
    @Query('businessId') businessId?: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.invoicesService.getStats(businessId, organizationId);
  }

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get invoices for a business account' })
  @ApiResponse({ status: 200, description: 'List of business invoices' })
  findByBusinessId(
    @Param('businessId') businessId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.invoicesService.findByBusinessId(
      businessId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('organization/:organizationId')
  @ApiOperation({ summary: 'Get invoices for an enterprise organization' })
  @ApiResponse({ status: 200, description: 'List of enterprise invoices' })
  findByOrganizationId(
    @Param('organizationId') organizationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.invoicesService.findByOrganizationId(
      organizationId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('number/:invoiceNumber')
  @ApiOperation({ summary: 'Get invoice by invoice number' })
  @ApiResponse({ status: 200, description: 'Invoice found' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  findByInvoiceNumber(@Param('invoiceNumber') invoiceNumber: string) {
    return this.invoicesService.findByInvoiceNumber(invoiceNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: 200, description: 'Invoice found' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update invoice' })
  @ApiResponse({ status: 200, description: 'Invoice updated successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.update(id, updateDto);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Mark invoice as paid' })
  @ApiResponse({ status: 200, description: 'Invoice marked as paid' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  markAsPaid(
    @Param('id') id: string,
    @Body('paymentMethod') paymentMethod?: string,
  ) {
    return this.invoicesService.markAsPaid(id, paymentMethod);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel invoice' })
  @ApiResponse({ status: 200, description: 'Invoice canceled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel paid invoice' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  cancel(@Param('id') id: string) {
    return this.invoicesService.cancel(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete invoice' })
  @ApiResponse({ status: 204, description: 'Invoice deleted successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  remove(@Param('id') id: string) {
    return this.invoicesService.remove(id);
  }
}
