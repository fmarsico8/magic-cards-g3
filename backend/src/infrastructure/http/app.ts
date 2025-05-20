import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import config from '../config/config';
import logger from '../logging/logger';
import apiRoutes from '../../interfaces/routes';
import { connectToDatabase } from '../database/mongo.config';
import { UserService } from '../../application/services/UserService';
import { userRepository } from '../../infrastructure/provider/Container';
import { UserAlreadyExistsError } from '../../domain/entities/exceptions/exceptions';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  public async initialize(): Promise<void> {
    await this.setupDatabase();
    await this.setupAdmin();
  }

  private setupMiddleware(): void {
    // Apply middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(compression());
    
    // Setup request logging
    if (config.isDevelopment) {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined', {
        stream: {
          write: (message: string) => logger.info(message.trim()),
        },
      }));
    }
  }

  private setupRoutes(): void {
    // Base route
    this.app.get('/', (_req: Request, res: Response) => {
      res.json({
        message: 'Express Clean Architecture API',
        environment: config.env,
        version: '1.0.0',
      });
    });

    // API routes
    this.app.use(config.server.apiPrefix, apiRoutes);
  }

  private setupErrorHandling(): void {
    // Not found handler
    this.app.use((_req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found',
      });
    });

    // Error handler
    this.app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      logger.error(`Unhandled error: ${err.message}`);
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: config.isDevelopment ? err.message : 'An unexpected error occurred',
      });
    });
  }

  private async setupDatabase(): Promise<void> {
    await connectToDatabase();
  }

  private async setupAdmin(): Promise<void> {
    const userService = new UserService(userRepository);
    const name     = process.env.ADMIN_NAME     || 'Administrator';
    const email    = process.env.ADMIN_EMAIL    || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'admin';
    const role     = 'admin';

    try {
      await userService.createUser({ name, email, password, role });
      logger.info('Admin user ensured in database');
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        logger.info('Admin user already exists');
      } else {
        logger.error('Error setting up admin user:', error);
      }
    }
  }
}

const appInstance = new App();
appInstance.initialize().catch(error => {
  logger.error('Failed to initialize application:', error);
  process.exit(1);
});

export default appInstance.app;
