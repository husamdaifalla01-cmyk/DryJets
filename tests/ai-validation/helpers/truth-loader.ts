/**
 * TRUTH MAP LOADER
 *
 * Loads and parses TRUTH_MAP.yaml to provide validation data
 * for AI-generated outputs.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

/**
 * Truth Map structure (mirrors TRUTH_MAP.yaml)
 */
export interface TruthMap {
  metadata: {
    version: string;
    last_updated: string;
    schema_source: string;
    api_docs_source: string;
  };
  database_models: Record<string, DatabaseModel>;
  enums: Record<string, EnumDefinition>;
  platforms: PlatformDefinitions;
  api_endpoints: APIEndpoints;
  services: Record<string, string[]>;
  external_apis: ExternalAPIs;
  validation_rules: ValidationRules;
}

export interface DatabaseModel {
  description: string;
  key_fields: string[];
  relationships?: string[];
}

export interface EnumDefinition {
  values: string[];
  description: string;
  frontend_values?: string[];
  note?: string;
}

export interface PlatformDefinitions {
  supported: string[];
  categories: Record<string, string[]>;
  oauth_enabled: string[];
  api_key_supported: string[];
}

export interface APIEndpoints {
  base_url: string;
  controllers: Record<string, Controller>;
}

export interface Controller {
  base_path: string;
  endpoints: Endpoint[];
}

export interface Endpoint {
  method: string;
  path: string;
  description: string;
  use_case?: string;
  status?: string;
}

export interface ExternalAPIs {
  trend_sources: Record<string, ExternalAPIConfig>;
  ai_providers: Record<string, ExternalAPIConfig>;
  seo_tools?: Record<string, ExternalAPIConfig>;
  video_generation?: Record<string, ExternalAPIConfig>;
  affiliate_networks?: Record<string, ExternalAPIConfig>;
}

export interface ExternalAPIConfig {
  provider: string;
  status: string;
  data_fields?: string[];
  models?: string[];
}

export interface ValidationRules {
  database: string[];
  api: string[];
  platforms: string[];
  services: string[];
  enums: string[];
  external_apis: string[];
}

/**
 * Truth Map Loader Class
 */
export class TruthMapLoader {
  private truthMap: TruthMap | null = null;
  private truthMapPath: string;

  constructor(customPath?: string) {
    if (customPath) {
      this.truthMapPath = customPath;
    } else {
      // Default path relative to project root
      this.truthMapPath = path.join(
        __dirname,
        '../../../docs/14-marketing-engine/TRUTH_MAP.yaml'
      );
    }
  }

  /**
   * Load TRUTH_MAP.yaml
   */
  public load(): TruthMap {
    if (this.truthMap) {
      return this.truthMap;
    }

    try {
      const fileContents = fs.readFileSync(this.truthMapPath, 'utf8');
      this.truthMap = yaml.parse(fileContents) as TruthMap;
      return this.truthMap;
    } catch (error) {
      throw new Error(
        `Failed to load TRUTH_MAP.yaml from ${this.truthMapPath}: ${error}`
      );
    }
  }

  /**
   * Get all database model names
   */
  public getModelNames(): string[] {
    const map = this.load();
    return Object.keys(map.database_models);
  }

  /**
   * Get fields for a specific model
   */
  public getModelFields(modelName: string): string[] {
    const map = this.load();
    const model = map.database_models[modelName];
    if (!model) {
      throw new Error(`Model '${modelName}' not found in TRUTH_MAP`);
    }
    return model.key_fields;
  }

  /**
   * Check if a model exists
   */
  public modelExists(modelName: string): boolean {
    const map = this.load();
    return modelName in map.database_models;
  }

  /**
   * Get all enum names
   */
  public getEnumNames(): string[] {
    const map = this.load();
    return Object.keys(map.enums);
  }

  /**
   * Get valid values for an enum
   */
  public getEnumValues(enumName: string): string[] {
    const map = this.load();
    const enumDef = map.enums[enumName];
    if (!enumDef) {
      throw new Error(`Enum '${enumName}' not found in TRUTH_MAP`);
    }
    return enumDef.values;
  }

  /**
   * Check if an enum value is valid
   */
  public isValidEnumValue(enumName: string, value: string): boolean {
    try {
      const validValues = this.getEnumValues(enumName);
      return validValues.includes(value);
    } catch {
      return false;
    }
  }

  /**
   * Get all supported platforms
   */
  public getPlatforms(): string[] {
    const map = this.load();
    return map.platforms.supported;
  }

  /**
   * Check if a platform is supported
   */
  public isPlatformSupported(platform: string): boolean {
    const platforms = this.getPlatforms();
    return platforms.includes(platform);
  }

  /**
   * Get all API endpoints for a controller
   */
  public getControllerEndpoints(controllerName: string): Endpoint[] {
    const map = this.load();
    const controller = map.api_endpoints.controllers[controllerName];
    if (!controller) {
      throw new Error(`Controller '${controllerName}' not found in TRUTH_MAP`);
    }
    return controller.endpoints;
  }

  /**
   * Check if an API endpoint exists
   */
  public endpointExists(
    controllerName: string,
    method: string,
    path: string
  ): boolean {
    try {
      const endpoints = this.getControllerEndpoints(controllerName);
      return endpoints.some(
        (ep) =>
          ep.method.toUpperCase() === method.toUpperCase() &&
          ep.path === path
      );
    } catch {
      return false;
    }
  }

  /**
   * Get all service names for a category
   */
  public getServices(category: string): string[] {
    const map = this.load();
    return map.services[category] || [];
  }

  /**
   * Check if a service exists
   */
  public serviceExists(serviceName: string): boolean {
    const map = this.load();
    return Object.values(map.services)
      .flat()
      .includes(serviceName);
  }

  /**
   * Get external API configuration
   */
  public getExternalAPI(category: string, apiName: string): ExternalAPIConfig | null {
    const map = this.load();
    const categoryAPIs = (map.external_apis as any)[category];
    if (!categoryAPIs) return null;
    return categoryAPIs[apiName] || null;
  }

  /**
   * Check if external API is implemented
   */
  public isExternalAPIImplemented(category: string, apiName: string): boolean {
    const api = this.getExternalAPI(category, apiName);
    return api?.status === 'implemented';
  }

  /**
   * Get validation rules
   */
  public getValidationRules(): ValidationRules {
    const map = this.load();
    return map.validation_rules;
  }

  /**
   * Validate a data structure against TRUTH_MAP
   * Returns array of validation errors
   */
  public validate(data: any, type: 'model' | 'endpoint' | 'enum' | 'service'): string[] {
    const errors: string[] = [];

    switch (type) {
      case 'model':
        if (data.model && !this.modelExists(data.model)) {
          errors.push(`Model '${data.model}' not found in TRUTH_MAP`);
        }
        break;

      case 'endpoint':
        if (data.controller && data.method && data.path) {
          if (!this.endpointExists(data.controller, data.method, data.path)) {
            errors.push(
              `Endpoint '${data.method} ${data.path}' not found in controller '${data.controller}'`
            );
          }
        }
        break;

      case 'enum':
        if (data.enumName && data.value) {
          if (!this.isValidEnumValue(data.enumName, data.value)) {
            errors.push(
              `Value '${data.value}' is not valid for enum '${data.enumName}'`
            );
          }
        }
        break;

      case 'service':
        if (data.serviceName && !this.serviceExists(data.serviceName)) {
          errors.push(`Service '${data.serviceName}' not found in TRUTH_MAP`);
        }
        break;
    }

    return errors;
  }
}

/**
 * Singleton instance
 */
let truthMapLoader: TruthMapLoader | null = null;

/**
 * Get singleton TruthMapLoader instance
 */
export function getTruthMapLoader(customPath?: string): TruthMapLoader {
  if (!truthMapLoader) {
    truthMapLoader = new TruthMapLoader(customPath);
  }
  return truthMapLoader;
}

/**
 * Load TRUTH_MAP.yaml (convenience function)
 */
export function loadTruthMap(customPath?: string): TruthMap {
  const loader = getTruthMapLoader(customPath);
  return loader.load();
}
