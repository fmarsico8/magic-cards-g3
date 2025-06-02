import { Request, Response } from 'express';
import { AuthService } from '../../application/services/AuthService';
import { CreateUserDTO } from '../../application/dtos/UserDTO';
import { HandlerRequest } from '@/domain/entities/HandlerRequest';
import { BadRequestException, HttpException, UnauthorizedException } from '../../domain/entities/exceptions/HttpException';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public async register(req: Request, res: Response): Promise<void> {
    HandlerRequest.handle(req, res, async () => {
      const userData: CreateUserDTO = req.body;
      
      if (!userData.email || !userData.password || !userData.name) {
        throw new BadRequestException('Name, email and password are required');
      }

      const result = await this.authService.register(userData);
      return result;
    }, 201, true);
  }

  public async login(req: Request, res: Response): Promise<void> {
    HandlerRequest.handle(req, res, async () => {
      const { email, password } = req.body;
      
      if (!email || !password) {
        throw new BadRequestException('Email and password are required');
      }

      const result = await this.authService.login({ email, password });
      return result;  
    }, 200, true);
  }

  public async getCurrentUser(req: Request, res: Response): Promise<void> {
    HandlerRequest.handle(req, res, async () => {
      if (!req.user) {
        throw new UnauthorizedException('Authentication required');
      }
      
      return {
        user: {
          id: req.user.userId,
          email: req.user.email,
        }
      };
    }, 200, true);
  }
} 