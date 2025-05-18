import { PaginationDTO, PaginatedResponseDTO } from '@/application/dtos/PaginationDTO';
import { UserFilterDTO } from '@/application/dtos/UserDTO';
import { User } from '../../../domain/entities/User';
import { UserRepository } from '../../../domain/repositories/UserRepository';

export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = Array.from(this.users.values());
    const user = users.find(u => u.getEmail() === email);
    return user || null;
  }

  async findPaginated(filters: PaginationDTO<UserFilterDTO>): Promise<PaginatedResponseDTO<User>> {
    const { data, offset, limit } = filters;
    const users = Array.from(this.users.values());
    const filteredUsers = users.filter(user => {
      if (data?.name) {
        return user.getName().toLowerCase().includes(data.name.toLowerCase());
      }
    });

    const paginatedUsers = filteredUsers.slice(offset || 0, (offset || 0) + (limit || 10));
    const total = filteredUsers.length;

    return {
      data: paginatedUsers,
      total,
      limit: limit || 10,
      offset: offset || 0,
      hasMore: (offset || 0) + (limit || 10) < total
    };
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async save(user: User): Promise<User> {
    this.users.set(user.getId(), user);
    return user;
  }

  async update(user: User): Promise<User> {
    this.users.set(user.getId(), user);
    return user;
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }
} 