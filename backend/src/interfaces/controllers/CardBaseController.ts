import { Request, Response } from 'express';
import { CardBaseService } from '../../application/services/CardBaseService';
import { CardBaseFilterDTO, CreateCardBaseDTO, UpdateCardBaseDTO } from '../../application/dtos/CardBaseDTO';
import { PaginationDTO } from '../../application/dtos/PaginationDTO';
import { HandlerRequest } from '../../domain/entities/HandlerRequest';
import { Validations } from '../../infrastructure/utils/Validations';

export class CardBaseController {
  constructor(private readonly cardBaseService: CardBaseService) {}

  public async createCardBase(req: Request, res: Response): Promise<void> {
    HandlerRequest.handle(req, res, async () => {
      const cardBaseData: CreateCardBaseDTO = req.body;
      Validations.validateId(cardBaseData.gameId, 'Game ID');
      Validations.requiredField(cardBaseData.nameCard, 'Name Base Card');
      const cardBase = await this.cardBaseService.createCardBase(cardBaseData);
      return cardBase;
    }, 201, true);
  }

  public async getCardBase(req: Request, res: Response): Promise<void> {
    HandlerRequest.handle(req, res, async () => {
      const cardBaseId = req.params.id;
      Validations.validateId(cardBaseId, 'CardBase ID');
      const cardBase = await this.cardBaseService.getCardBase(cardBaseId);
      return cardBase;
    }, 200, true);
  }

  public async getAllCardBases(req: Request, res: Response): Promise<void> {
    HandlerRequest.handle(req, res, async () => {
      const gameId = req.query.gameId as string | undefined;
      const cardBases = await this.cardBaseService.getAllCardBases(gameId);
      return cardBases;
    }, 200, true);
  }

  public async getAllCardBasesPaginated(req: Request, res: Response): Promise<void> {
    HandlerRequest.handle(req, res, async () => {
        const filters: PaginationDTO<CardBaseFilterDTO> = {
            data: {
                nameCard: req.query.name ? (req.query.name as string) : undefined,
                gameId: req.query.gameId ? (req.query.gameId as string) : undefined,
            },
            limit: req.query.limit ? Number(req.query.limit) : undefined,
            offset: req.query.offset ? Number(req.query.offset) : undefined,
        };

        const cards = await this.cardBaseService.getAllCardBasesPaginated(filters);
        return cards;
    }, 200, true);
  }

  public async updateCardBase(req: Request, res: Response): Promise<void> {
    HandlerRequest.handle(req, res, async () => {
      const cardBaseId = req.params.id;
      Validations.validateId(cardBaseId, 'CardBase ID');
      const cardBaseData: UpdateCardBaseDTO = req.body;
      const cardBase = await this.cardBaseService.updateCardBase(cardBaseId, cardBaseData);
      return cardBase;
    }, 200, true);
  }

  public async deleteCardBase(req: Request, res: Response): Promise<void> {
    HandlerRequest.handle(req, res, async () => {
      const cardBaseId = req.params.id;
      Validations.validateId(cardBaseId, 'CardBase ID');
      await this.cardBaseService.deleteCardBase(cardBaseId);
    }, 204, false);
  }
} 