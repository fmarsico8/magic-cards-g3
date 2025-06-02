import { BadRequestException, NotFoundException, UnauthorizedException } from '../../domain/entities/exceptions/HttpException';

export class Validations {
  static requiredField(value: any, fieldName: string): void {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      throw new BadRequestException(`${fieldName} is required`);
    }
  }

  static validateId(id: string, label = 'ID'): string {
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
  
  
}
