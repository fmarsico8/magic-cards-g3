import bcrypt from 'bcrypt';
import { JwtService, TokenResponse } from '../../infrastructure/auth/jwt.service';
import { CreateUserDTO } from '../dtos/UserDTO';
import { UserService } from './UserService';
import { UnauthorizedException } from '../../domain/entities/exceptions/HttpException';
import { Validations } from '../../infrastructure/utils/Validations';


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

const loginAttempts: Record<string, { count: number; lastAttempt: Date }> = {};
const MAX_ATTEMPTS = 5;
const BLOCK_TIME_MS = 5 * 60 * 1000; // 5 minutos


export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {}

  public async register(userData: CreateUserDTO): Promise<AuthResponseDTO> {
    Validations.validatePasswordComplexity(userData.password);
    const savedUser = await this.userService.createUser(userData);

    const tokens = this.jwtService.generateTokens(savedUser);

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
    const email = credentials.email;
    const now = new Date();
  
    const attempt = loginAttempts[email];
    if (attempt && attempt.count >= MAX_ATTEMPTS) {
      const elapsed = now.getTime() - attempt.lastAttempt.getTime();
      if (elapsed < BLOCK_TIME_MS) {
        throw new UnauthorizedException('Too many failed attempts. Try again later.');
      } else {
        delete loginAttempts[email];
      }
    }
  
    try {
      const user = await this.userService.getUser(email);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const isPasswordValid = await this.comparePasswords(credentials.password, user.getPassword());
  
      if (!isPasswordValid) {
        this.registerFailedAttempt(email, now);
        throw new UnauthorizedException('Invalid credentials');
      }
  
      delete loginAttempts[email];
  
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
    } catch (err) {
      if (!(err instanceof UnauthorizedException)) {
        throw err;
      }
  
      this.registerFailedAttempt(email, now);
      throw err;
    }
  }
  
  private registerFailedAttempt(email: string, now: Date): void {
    if (!loginAttempts[email]) {
      loginAttempts[email] = { count: 1, lastAttempt: now };
    } else {
      loginAttempts[email].count += 1;
      loginAttempts[email].lastAttempt = now;
    }
  }
  

  private async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
} 