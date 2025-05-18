import { User } from '../entities/User';
import { PaginationDTO, PaginatedResponseDTO } from '@/application/dtos/PaginationDTO';
import { UserFilterDTO } from '@/application/dtos/UserDTO';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findPaginated(filters: PaginationDTO<UserFilterDTO>): Promise<PaginatedResponseDTO<User>>;
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<boolean>;
} 