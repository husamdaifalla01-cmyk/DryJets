# Contributing to DryJets

Thank you for your interest in contributing to DryJets! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

---

## 🤝 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain professional communication

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher
- **PostgreSQL** 16.x
- **Git** 2.x or higher

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/USERNAME/DryJets.git
   cd DryJets
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database:**
   ```bash
   cd packages/database
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start development servers:**
   ```bash
   # API Server
   cd apps/api && npm run dev

   # Merchant Portal
   cd apps/web-merchant && npm run dev

   # Mobile Customer App
   cd apps/mobile-customer && npm run dev
   ```

For detailed setup instructions, see [GETTING_STARTED.md](./GETTING_STARTED.md).

---

## 🔄 Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

**Branch Naming Conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks

**Examples:**
- `feature/payment-integration`
- `fix/order-status-bug`
- `docs/api-endpoints`

### 2. Make Your Changes

- Follow the [coding standards](#coding-standards)
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass

### 3. Commit Your Changes

Follow the [commit guidelines](#commit-guidelines):

```bash
git add .
git commit -m "feat: add stripe payment integration"
```

### 4. Push to Your Branch

```bash
git push origin feature/your-feature-name
```

### 5. Create a Pull Request

- Go to the repository on GitHub
- Click "New Pull Request"
- Select your branch
- Fill out the PR template
- Request review from team members

---

## 📝 Coding Standards

### TypeScript

**✅ Good:**
```typescript
const order: Order = await this.ordersService.findById(id);

interface CreateOrderDto {
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
}
```

**❌ Bad:**
```typescript
const order: any = await this.ordersService.findById(id);

// Missing types
function createOrder(data) {
  // ...
}
```

### Error Handling

**✅ Good:**
```typescript
try {
  const order = await this.ordersService.create(dto);
  return { success: true, data: order };
} catch (error) {
  if (error instanceof BadRequestException) {
    throw error;
  }
  throw new InternalServerErrorException('Failed to create order');
}
```

**❌ Bad:**
```typescript
const order = await this.ordersService.create(dto);
// No error handling
```

### API Responses

**Consistent Format:**
```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "total": 100 }
}

// Error
{
  "success": false,
  "error": {
    "message": "Order not found",
    "code": "ORDER_NOT_FOUND"
  }
}
```

### Database Queries

**✅ Good - Include relations in one query:**
```typescript
const order = await this.prisma.order.findUnique({
  where: { id },
  include: {
    items: true,
    customer: true,
    merchant: true,
  },
});
```

**❌ Bad - Multiple queries:**
```typescript
const order = await this.prisma.order.findUnique({ where: { id } });
const items = await this.prisma.orderItem.findMany({ where: { orderId: id } });
```

### React/React Native Components

**✅ Good:**
```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({ title, onPress, variant = 'primary', disabled = false }: ButtonProps) {
  // Component logic
}
```

**❌ Bad:**
```typescript
export function Button(props) {
  // No type safety
}
```

---

## 📜 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style changes (formatting, semicolons, etc.)
- **refactor:** Code refactoring
- **test:** Adding or updating tests
- **chore:** Maintenance tasks
- **perf:** Performance improvements

### Examples

```bash
feat(orders): add payment processing endpoint
fix(auth): resolve JWT token expiration issue
docs(api): update Swagger documentation
refactor(database): optimize Prisma queries
test(orders): add unit tests for order creation
chore(deps): update dependencies to latest versions
```

### Detailed Commit Example

```bash
git commit -m "feat(payments): integrate Stripe payment processing

- Add Stripe SDK to dependencies
- Create payment service with Stripe Connect
- Implement payment intent creation
- Add webhook handler for payment events
- Update order status after successful payment

Resolves: #123
```

---

## 🔀 Pull Request Process

### PR Title Format

Follow the same format as commit messages:

```
feat(orders): add self-service fulfillment modes
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Code follows project coding standards
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass locally
- [ ] No console errors/warnings
```

### Review Process

1. **Automated Checks:** CI/CD pipeline runs tests
2. **Peer Review:** At least one team member reviews
3. **Address Feedback:** Make requested changes
4. **Approval:** PR approved by reviewer(s)
5. **Merge:** Squash and merge to main branch

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests for specific workspace
npm run test --workspace=@dryjets/api

# Run tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e
```

### Writing Tests

**Unit Test Example:**
```typescript
describe('OrdersService', () => {
  describe('create', () => {
    it('should create order with correct pricing', async () => {
      const dto: CreateOrderDto = {
        customerId: 'cust-123',
        merchantId: 'merch-456',
        items: [{ serviceId: 'svc-789', quantity: 1 }],
      };

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(result.totalAmount).toBeGreaterThan(0);
    });

    it('should throw error if merchant not found', async () => {
      const dto: CreateOrderDto = {
        customerId: 'cust-123',
        merchantId: 'invalid-id',
        items: [],
      };

      await expect(service.create(dto)).rejects.toThrow();
    });
  });
});
```

### Test Coverage Requirements

- **Unit Tests:** Aim for 80%+ coverage on business logic
- **Integration Tests:** Cover all API endpoints
- **E2E Tests:** Cover critical user flows

---

## 📚 Additional Resources

- [Project Documentation](./docs/README.md)
- [Architecture Overview](./docs/02-architecture/project-overview.md)
- [API Documentation](http://localhost:3000/api/docs)
- [Getting Started Guide](./GETTING_STARTED.md)

---

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Description:** Clear description of the issue
2. **Steps to Reproduce:** Detailed steps to reproduce the bug
3. **Expected Behavior:** What should happen
4. **Actual Behavior:** What actually happens
5. **Environment:**
   - OS: macOS/Windows/Linux
   - Node version
   - npm version
   - Browser (if applicable)
6. **Screenshots/Logs:** If applicable

---

## 💡 Suggesting Features

When suggesting new features:

1. **Use Case:** Describe the problem you're trying to solve
2. **Proposed Solution:** Your suggested approach
3. **Alternatives:** Other solutions you've considered
4. **Additional Context:** Any other relevant information

---

## ❓ Questions?

- Check the [documentation](./docs/README.md)
- Ask in team Slack/Discord
- Open a GitHub discussion
- Email: dev@dryjets.com

---

## 📄 License

By contributing to DryJets, you agree that your contributions will be licensed under the project's license.

---

**Thank you for contributing to DryJets! 🚀**
