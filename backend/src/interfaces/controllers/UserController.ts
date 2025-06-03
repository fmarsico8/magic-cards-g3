import { Request, Response } from 'express';
import { UserService } from '../../application/services/UserService';
import { CreateUserDTO, UpdateUserDTO } from '../../application/dtos/UserDTO';
import { HandlerRequest } from './HandlerRequest';

export class UserController {
  constructor(private readonly userService: UserService) {}

  public async createUser(req: Request, res: Response): Promise<void> {
    HandlerRequest.handle(req, res, async () => {
      const adminId = req.user?.userId;
      const userData: CreateUserDTO = req.body;
      const user = await this.userService.createUserByAdmin(userData, adminId);
      return user;
    }, 201, true);
  }
  
  public async getUser(req: Request, res: Response): Promise<void> {
    HandlerRequest.handle(req, res, async () => {
      const adminId = req.user?.userId;
      const userEmail = req.params.email;
      const user = await this.userService.getUserByAdmin(userEmail, adminId);
      return user
    }, 200, true);
  }

  public async updateUser(req: Request, res: Response): Promise<void> {
    HandlerRequest.handle(req, res, async () => {
      const userId = req.user?.userId;
      const toUpdateUserId = req.params.id;
      const userData: UpdateUserDTO = req.body;
      const user = await this.userService.updateUser(toUpdateUserId, userData, userId);
      return user;
    }, 200, true);
  }

  public async deleteUser(req: Request, res: Response): Promise<void> {
    HandlerRequest.handle(req, res, async () => {
      const userId = req.user?.userId;
      const toDeleteUserId = req.params.id;
      await this.userService.deleteUser(toDeleteUserId, userId);
      return;
    }, 204, false);
  }
} 
