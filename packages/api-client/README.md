# @dryjets/api-client

Type-safe API client for DryJets platform, auto-generated from OpenAPI specification.

## Features

- ✅ **Fully type-safe** - Generated from NestJS Swagger/OpenAPI spec
- ✅ **Auto-completion** - IntelliSense for all endpoints, request/response types
- ✅ **Axios-based** - Familiar HTTP client with interceptors
- ✅ **Authentication** - Automatic token management
- ✅ **Error handling** - Consistent error formatting and handling
- ✅ **Environment-aware** - Configurable base URL

## Installation

This package is part of the DryJets monorepo and uses npm workspaces.

```bash
# Install dependencies (from monorepo root)
npm install

# Generate API client
cd packages/api-client
npm run generate
```

## Generation

The API client is auto-generated from the NestJS API's OpenAPI specification.

### Prerequisites

1. The NestJS API must be built or running
2. The `apps/api/openapi.json` file must exist

### Generate Client

```bash
# Option 1: Generate from root
npm run generate --workspace=@dryjets/api-client

# Option 2: Generate from package directory
cd packages/api-client
npm run generate
```

### Integration with Turborepo

The generation is automatically triggered as part of the build pipeline:

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]
    }
  }
}
```

When you build any frontend app, it will:
1. Build the API first
2. Generate the OpenAPI spec
3. Generate the TypeScript client
4. Build the frontend with type-safe imports

## Usage

### Basic Usage

```typescript
import { client } from '@dryjets/api-client';

// GET request
const users = await client.get('/users');

// POST request
const newUser = await client.post('/users', {
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
});

// With TypeScript types
import type { User, CreateUserDto } from '@dryjets/api-client';

const userData: CreateUserDto = {
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'BUSINESS',
};

const response = await client.post<User>('/users', userData);
const user: User = response.data;
```

### Authentication

The client automatically manages authentication tokens:

```typescript
import { client } from '@dryjets/api-client';

// Login
const response = await client.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123',
});

// Store token (automatic in interceptor)
localStorage.setItem('auth_token', response.data.accessToken);

// Subsequent requests automatically include the token
const profile = await client.get('/users/me');
```

### Custom Configuration

```typescript
import { createApiClient, setApiClient } from '@dryjets/api-client';

// Create custom client
const customClient = createApiClient({
  baseURL: 'https://api.dryjets.com',
  timeout: 10000,
  headers: {
    'X-Custom-Header': 'value',
  },
  onRequest: async (config) => {
    // Custom request logic
    console.log('Making request:', config.url);
    return config;
  },
  onResponse: (response) => {
    // Custom response logic
    console.log('Response received:', response.status);
    return response;
  },
  onError: async (error) => {
    // Custom error handling
    console.error('Request failed:', error.message);
    throw error;
  },
});

// Set as default client
setApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});
```

### React Integration

#### With React Query

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { client } from '@dryjets/api-client';
import type { User } from '@dryjets/api-client';

// Fetch users
function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await client.get<User[]>('/users');
      return response.data;
    },
  });
}

// Create user
function useCreateUser() {
  return useMutation({
    mutationFn: async (userData: CreateUserDto) => {
      const response = await client.post<User>('/users', userData);
      return response.data;
    },
  });
}

// Usage in component
function UsersPage() {
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {users?.map((user) => (
        <div key={user.id}>{user.email}</div>
      ))}
    </div>
  );
}
```

#### With SWR

```typescript
import useSWR from 'swr';
import { client } from '@dryjets/api-client';

const fetcher = (url: string) => client.get(url).then((res) => res.data);

function useUser(userId: string) {
  const { data, error, isLoading } = useSWR(`/users/${userId}`, fetcher);

  return {
    user: data,
    isLoading,
    error,
  };
}
```

### Next.js Integration

#### API Route (Server-Side)

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { createApiClient } from '@dryjets/api-client';

export async function GET() {
  const client = createApiClient({
    baseURL: process.env.API_URL || 'http://localhost:4000',
  });

  try {
    const response = await client.get('/users');
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
```

#### Server Component

```typescript
// app/users/page.tsx
import { createApiClient } from '@dryjets/api-client';
import type { User } from '@dryjets/api-client';

async function getUsers(): Promise<User[]> {
  const client = createApiClient({
    baseURL: process.env.API_URL || 'http://localhost:4000',
  });

  const response = await client.get<User[]>('/users');
  return response.data;
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div>
      {users.map((user) => (
        <div key={user.id}>{user.email}</div>
      ))}
    </div>
  );
}
```

## Environment Variables

Configure the API client with environment variables:

```bash
# .env.local (Next.js apps)
NEXT_PUBLIC_API_URL=http://localhost:4000

# .env (NestJS API)
API_URL=http://localhost:4000
```

## Type Safety

All types are auto-generated from the OpenAPI spec:

```typescript
// Generated types are available for import
import type {
  // Entities
  User,
  Order,
  Merchant,
  Campaign,

  // DTOs
  CreateUserDto,
  UpdateUserDto,
  CreateOrderDto,

  // Responses
  UserResponse,
  OrderResponse,
  PaginatedResponse,

  // Enums
  UserRole,
  OrderStatus,
  CampaignStatus,
} from '@dryjets/api-client';

// Full IntelliSense support
const user: User = {
  id: 'user_123',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: UserRole.BUSINESS, // Enum with auto-completion
  status: 'ACTIVE',
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

## Error Handling

Consistent error format across all requests:

```typescript
import { client } from '@dryjets/api-client';
import type { AxiosError } from '@dryjets/api-client';

try {
  await client.post('/users', invalidData);
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error('Status:', error.response.status);
    console.error('Data:', error.response.data);
  } else if (error.request) {
    // Request made but no response
    console.error('No response received');
  } else {
    // Error setting up request
    console.error('Error:', error.message);
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Generate client from OpenAPI spec
npm run generate

# Clean generated files
npm run clean

# Re-generate
npm run clean && npm run generate
```

## Troubleshooting

### Error: "Cannot find module './generated'"

**Solution**: Run the generation script:
```bash
npm run generate
```

### Error: "OpenAPI spec not found"

**Solution**: Build the API first:
```bash
cd apps/api
npm run build
```

### Type errors after API changes

**Solution**: Regenerate the client:
```bash
cd packages/api-client
npm run clean && npm run generate
```

## Architecture

```
packages/api-client/
├── src/
│   ├── client.ts          # Axios client configuration
│   ├── index.ts           # Main exports
│   └── generated/         # Auto-generated (gitignored)
│       ├── types.ts       # TypeScript types
│       ├── services.ts    # API service classes
│       └── models.ts      # Request/response models
├── scripts/
│   └── generate-client.ts # Generation script
├── openapi-ts.config.ts   # Codegen configuration
└── package.json
```

## Contributing

When adding new API endpoints:

1. Update NestJS controllers with Swagger decorators
2. Build the API to generate OpenAPI spec
3. Run `npm run generate` to update the client
4. Types and endpoints are automatically available

## License

Private - Part of DryJets platform
