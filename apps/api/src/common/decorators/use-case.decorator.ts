/**
 * USE CASE DECORATOR
 *
 * @description Marks methods and classes with their corresponding use case ID for traceability
 * @references ARCHITECTURAL_GOVERNANCE.md#use-case-traceability
 */

/**
 * UseCase Decorator
 *
 * Maps code to use cases from MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md
 *
 * @param useCaseId - Use case ID (e.g., "UC070", "UC071")
 * @param description - Brief description of the use case
 *
 * @example
 * ```typescript
 * @UseCase('UC070', 'Collect Trends from Multiple Sources')
 * async collectAllTrends() {
 *   // implementation
 * }
 * ```
 */
export function UseCase(useCaseId: string, description?: string): MethodDecorator & ClassDecorator {
  return function (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) {
    // Store metadata for documentation and validation
    if (propertyKey) {
      // Method decorator
      Reflect.defineMetadata('useCase:id', useCaseId, target, propertyKey);
      if (description) {
        Reflect.defineMetadata('useCase:description', description, target, propertyKey);
      }
    } else {
      // Class decorator
      Reflect.defineMetadata('useCase:id', useCaseId, target);
      if (description) {
        Reflect.defineMetadata('useCase:description', description, target);
      }
    }

    return descriptor as any;
  };
}

/**
 * Get use case metadata from a method or class
 */
export function getUseCaseMetadata(target: any, propertyKey?: string | symbol): {
  id: string;
  description?: string;
} | null {
  const id = propertyKey
    ? Reflect.getMetadata('useCase:id', target, propertyKey)
    : Reflect.getMetadata('useCase:id', target);

  if (!id) return null;

  const description = propertyKey
    ? Reflect.getMetadata('useCase:description', target, propertyKey)
    : Reflect.getMetadata('useCase:description', target);

  return { id, description };
}
