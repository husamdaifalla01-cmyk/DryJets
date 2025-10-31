import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  client: '@hey-api/client-axios',
  input: '../../apps/api/openapi.json',
  output: {
    format: 'prettier',
    path: './src/generated',
  },
  types: {
    enums: 'javascript',
  },
  services: {
    asClass: true,
  },
});
