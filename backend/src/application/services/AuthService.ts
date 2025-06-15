import bcrypt from 'bcrypt';
import { JwtService, TokenResponse } from '../../infrastructure/auth/jwt.service';
import { CreateUserDTO } from '../dtos/UserDTO';
import { UserService } from './UserService';
import { UnauthorizedException } from '../../domain/entities/exceptions/HttpException';
import { notifierService } from '../../infrastructure/provider/Container';


interface LoginDTO {
  email: string;
  password: string;
}

interface AuthResponseDTO {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  tokens: TokenResponse;
}

export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {}

  public async register(userData: CreateUserDTO): Promise<AuthResponseDTO> {
    
    const savedUser = await this.userService.createUser(userData);

    const tokens = this.jwtService.generateTokens(savedUser);

    await notifierService.notify(savedUser.getEmail(), 'Bienvenido a la plataforma', 'Gracias por registrarte en nuestra plataforma. Esperamos que disfrutes de nuestros servicios.');

    return {
      user: {
        id: savedUser.getId(),
        name: savedUser.getName(),
        email: savedUser.getEmail(),
        role: savedUser.getRole(),
      },
      tokens,
    };
  }

  public async login(credentials: LoginDTO): Promise<AuthResponseDTO> {
    
    const user = await this.userService.getUser(credentials.email);

    const isPasswordValid = await user.isPasswordValid(
      credentials.password,
      this.comparePasswords.bind(this)
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.jwtService.generateTokens(user);

    return {
      user: {
        id: user.getId(),
        name: user.getName(),
        email: user.getEmail(),
        role: user.getRole(),
      },
      tokens,
    };
  }

  private async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
} 