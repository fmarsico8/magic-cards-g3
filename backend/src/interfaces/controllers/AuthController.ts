import { Request, Response } from 'express';
import { AuthService } from '../../application/services/AuthService';
import { CreateUserDTO } from '../../application/dtos/UserDTO';
import { HandlerRequest } from './HandlerRequest';
import { Validations } from '../../infrastructure/utils/Validations';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public async register(req: Request, res: Response): Promise<void> {
    HandlerRequest.handle(req, res, async () => {
      const userData: CreateUserDTO = req.body;
      Validations.requiredField(userData.name, 'Name');
      Validations.requiredField(userData.email, 'Email');
      Validations.requiredField(userData.password, 'Password');
      const result = await this.authService.register(userData);
      return result;
    }, 201, true);
  }

  public async login(req: Request, res: Response): Promise<void> {
    HandlerRequest.handle(req, res, async () => {
      const { email, password } = req.body;
      Validations.requiredField(email, 'Email');
      Validations.requiredField(password, 'Password');
      const result = await this.authService.login({ email, password });
      return result;  
    }, 200, true);
  }

  public async getCurrentUser(req: Request, res: Response): Promise<void> {
    HandlerRequest.handle(req, res, async () => {
      const user = Validations.requireUser(req.user);
      return {
        user: {
          id: user.userId,
          email: user.email,
        }
      };
    }, 200, true);
  }
  
} 