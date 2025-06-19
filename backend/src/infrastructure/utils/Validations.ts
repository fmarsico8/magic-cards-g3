import { BadRequestException, NotFoundException, UnauthorizedException } from '../../domain/entities/exceptions/HttpException';

export class Validations {
  static requiredField(value: any, fieldName: string): void {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      throw new BadRequestException(`${fieldName} is required`);
    }
  }

  static validateId(id?: string, label = 'ID'): string {
    if (!id || id.trim() === '') {
      throw new BadRequestException(`${label} is required`);
    }
    return id;
  }

  static ensureFound<T>(value: T | undefined | null, entityName = 'Resource'): T {
    if (value == null) {
      throw new NotFoundException(`${entityName} not found`);
    }
    return value;
  }

  static requireUser(user: { userId: string; email: string } | undefined | null): { userId: string; email: string } {
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    return user;
  }

  static ensureAllIdsFound(found: string[], requested: string[], entity: string): void {
    const missing = requested.filter(id => !found.includes(id));
    if (missing.length > 0) {
      throw new BadRequestException(`Invalid ${entity}s with IDs: ${missing.join(', ')}`);
    }
  }

  static ensureUniqueName(bool: boolean, entity: string): void {
    if (bool) {
      throw new BadRequestException(`${entity} name already exists`);
    }
  }

  static normalizeName(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
    
}
