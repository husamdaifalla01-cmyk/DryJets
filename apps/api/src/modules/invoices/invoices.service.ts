import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceDto, InvoiceStatus } from './dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate next invoice number
   */
  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    // Count invoices this month
    const count = await this.prisma.invoice.count({
      where: {
        invoiceNumber: {
          startsWith: `INV-${year}-${month}`,
        },
      },
    });

    const nextNumber = String(count + 1).padStart(4, '0');
    return `INV-${year}-${month}-${nextNumber}`;
  }

  /**
   * Create a new invoice
   */
  async create(createDto: CreateInvoiceDto) {
    // Validate that either businessId or organizationId is provided
    if (!createDto.businessId && !createDto.organizationId) {
      throw new BadRequestException('Either businessId or organizationId must be provided');
    }

    if (createDto.businessId && createDto.organizationId) {
      throw new BadRequestException('Cannot specify both businessId and organizationId');
    }

    // Generate invoice number if not provided
    let invoiceNumber = createDto.invoiceNumber;
    if (!invoiceNumber) {
      invoiceNumber = await this.generateInvoiceNumber();
    }

    const { lineItems, ...invoiceData } = createDto;

    return this.prisma.invoice.create({
      data: {
        ...invoiceData,
        invoiceNumber,
        lineItems: {
          create: lineItems,
        },
      },
      include: {
        lineItems: true,
        businessAccount: {
          select: {
            id: true,
            companyName: true,
            billingEmail: true,
          },
        },
        enterpriseAccount: {
          select: {
            id: true,
            name: true,
            billingEmail: true,
          },
        },
      },
    });
  }

  /**
   * Get all invoices (with filtering)
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
    status?: InvoiceStatus,
    businessId?: string,
    organizationId?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (businessId) where.businessId = businessId;
    if (organizationId) where.organizationId = organizationId;

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        include: {
          lineItems: true,
          businessAccount: {
            select: {
              id: true,
              companyName: true,
            },
          },
          enterpriseAccount: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get invoice by ID
   */
  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        lineItems: true,
        businessAccount: {
          select: {
            id: true,
            companyName: true,
            billingEmail: true,
            taxId: true,
          },
        },
        enterpriseAccount: {
          select: {
            id: true,
            name: true,
            billingEmail: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice #${id} not found`);
    }

    return invoice;
  }

  /**
   * Get invoice by invoice number
   */
  async findByInvoiceNumber(invoiceNumber: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { invoiceNumber },
      include: {
        lineItems: true,
        businessAccount: true,
        enterpriseAccount: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceNumber} not found`);
    }

    return invoice;
  }

  /**
   * Update invoice
   */
  async update(id: string, updateDto: UpdateInvoiceDto) {
    await this.findOne(id);

    return this.prisma.invoice.update({
      where: { id },
      data: updateDto,
      include: {
        lineItems: true,
      },
    });
  }

  /**
   * Mark invoice as paid
   */
  async markAsPaid(id: string, paymentMethod?: string) {
    await this.findOne(id);

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.PAID,
        paidAt: new Date(),
        paymentMethod,
      },
    });
  }

  /**
   * Cancel invoice
   */
  async cancel(id: string) {
    const invoice = await this.findOne(id);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot cancel a paid invoice');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.CANCELED,
      },
    });
  }

  /**
   * Delete invoice
   */
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.invoice.delete({
      where: { id },
    });
  }

  /**
   * Get invoices for a business account
   */
  async findByBusinessId(businessId: string, page: number = 1, limit: number = 20) {
    return this.findAll(page, limit, undefined, businessId, undefined);
  }

  /**
   * Get invoices for an enterprise organization
   */
  async findByOrganizationId(organizationId: string, page: number = 1, limit: number = 20) {
    return this.findAll(page, limit, undefined, undefined, organizationId);
  }

  /**
   * Get overdue invoices
   */
  async findOverdue(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const now = new Date();

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where: {
          status: InvoiceStatus.PENDING,
          dueDate: {
            lt: now,
          },
        },
        skip,
        take: limit,
        include: {
          businessAccount: {
            select: {
              companyName: true,
              billingEmail: true,
            },
          },
          enterpriseAccount: {
            select: {
              name: true,
              billingEmail: true,
            },
          },
        },
        orderBy: {
          dueDate: 'asc',
        },
      }),
      this.prisma.invoice.count({
        where: {
          status: InvoiceStatus.PENDING,
          dueDate: {
            lt: now,
          },
        },
      }),
    ]);

    // Update status to OVERDUE
    await this.prisma.invoice.updateMany({
      where: {
        status: InvoiceStatus.PENDING,
        dueDate: {
          lt: now,
        },
      },
      data: {
        status: InvoiceStatus.OVERDUE,
      },
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get invoice statistics
   */
  async getStats(businessId?: string, organizationId?: string) {
    const where: any = {};
    if (businessId) where.businessId = businessId;
    if (organizationId) where.organizationId = organizationId;

    const [total, paid, pending, overdue, draft] = await Promise.all([
      this.prisma.invoice.aggregate({
        where,
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.invoice.aggregate({
        where: { ...where, status: InvoiceStatus.PAID },
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.invoice.aggregate({
        where: { ...where, status: InvoiceStatus.PENDING },
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.invoice.aggregate({
        where: { ...where, status: InvoiceStatus.OVERDUE },
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.invoice.count({
        where: { ...where, status: InvoiceStatus.DRAFT },
      }),
    ]);

    return {
      total: {
        amount: total._sum.total || 0,
        count: total._count,
      },
      paid: {
        amount: paid._sum.total || 0,
        count: paid._count,
      },
      pending: {
        amount: pending._sum.total || 0,
        count: pending._count,
      },
      overdue: {
        amount: overdue._sum.total || 0,
        count: overdue._count,
      },
      draft: {
        count: draft,
      },
    };
  }
}
