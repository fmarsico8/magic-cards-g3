import { Request, Response } from 'express';
import { GameService } from '../../application/services/GameService';
import { CreateGameDTO, UpdateGameDTO, GameFilterDTO} from '../../application/dtos/GameDTO';
import { PaginationDTO } from '../../application/dtos/PaginationDTO';
import { HandlerRequest } from './HandlerRequest';
import { Validations } from '../../infrastructure/utils/Validations';

export class GameController {
  constructor(private readonly gameService: GameService) {}

  public async createGame(req: Request, res: Response): Promise<void> {
    HandlerRequest.handle(req, res, async () => {
      const gameData: CreateGameDTO = req.body;
      Validations.requiredField(gameData.name, 'Game name');
      const game = await this.gameService.createGame(gameData);
      return game;
    }, 201, true);
  }

  public async getGame(req: Request, res: Response): Promise<void> {
    HandlerRequest.handle(req, res, async () => {
      const gameId = Validations.validateId(req.params.id, 'Game ID');
      const game = await this.gameService.getGame(gameId);
      return game;
    }, 200, true);
  }

  public async getAllGames(req: Request, res: Response): Promise<void> {
    HandlerRequest.handle(req, res, async () => {
      const games = await this.gameService.getAllGames();
      return games;
    }, 200, true);
  }

  public async getAllGamesPaginated(req: Request, res: Response): Promise<void> {
    HandlerRequest.handle(req, res, async () => {
      const GameFilterDTO = {
        name: req.query.game ? (req.query.game as string) : ""
      }
      const filters: PaginationDTO<GameFilterDTO> = {
        data: GameFilterDTO,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined,
    };
      const games = await this.gameService.getAllGamesPaginated(filters);
      return games;
    }, 200, true);
  }


  public async updateGame(req: Request, res: Response): Promise<void> {
    HandlerRequest.handle(req, res, async () => {
      const gameId = Validations.validateId(req.params.id, 'Game ID');
      const gameData: UpdateGameDTO = req.body;
      const game = await this.gameService.updateGame(gameId, gameData);
      return game;
    }, 200, true);
  }

  public async deleteGame(req: Request, res: Response): Promise<void> {
    HandlerRequest.handle(req, res, async () => {
      const gameId = Validations.validateId(req.params.id, 'Game ID');
      await this.gameService.deleteGame(gameId);
      return;
    }, 204, false);
  }
} 