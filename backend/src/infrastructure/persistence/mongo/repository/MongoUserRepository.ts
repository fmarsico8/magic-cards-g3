import { UserRepository } from "../../../../domain/repositories/UserRepository";
import { User } from "../../../../domain/entities/User";
import { UserModel } from "../models/UserModel";
import { toUserEntity, toUserDocument } from "../mappers/user.mapper";
import { PaginatedResponseDTO } from "@/application/dtos/PaginationDTO";
import { PaginationDTO } from "@/application/dtos/PaginationDTO";
import { UserFilterDTO } from "@/application/dtos/UserDTO";

export class MongoUserRepository implements UserRepository {
  private userModel: UserModel;

  constructor() {
    this.userModel = new UserModel();
  }

  async findById(id: string): Promise<User | null> {
    const doc = await this.userModel.findById(id);
    return doc ? toUserEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    // Use Mongoose query instead of in-memory filtering
    const doc = await this.userModel.findByEmail(email);
    return doc ? toUserEntity(doc) : null;
  }

  async findPaginated(filters: PaginationDTO<UserFilterDTO>): Promise<PaginatedResponseDTO<User>> {
    const { docs, total } = await this.userModel.findPaginatedWithFilters(
      filters.data,
      filters.offset || 0,
      filters.limit || 10
    );

    return {
      data: docs.map(toUserEntity),
      total,
      limit: filters.limit || 10,
      offset: filters.offset || 0,
      hasMore: (filters.offset || 0) + (filters.limit || 10) < total,
    };
  }

  async save(user: User): Promise<User> {
    await this.userModel.create(toUserDocument(user));
    return user;
  }

  async update(user: User): Promise<User> {
    await this.userModel.update(user.getId(), toUserDocument(user));
    return user;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.delete(id);
    return result !== null;
  }
}