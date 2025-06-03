import { CardFilterDTO, CardUpdatedDTO, CreateCardDTO } from '../../application/dtos/CardsDTO';
import { CardService } from '../../application/services/CardService';
import { Request, Response } from 'express';
import { PaginationDTO } from '../../application/dtos/PaginationDTO';
import { HandlerRequest } from './HandlerRequest';
import { Validations } from '../../infrastructure/utils/Validations';

export class CardController {
    constructor(private readonly cardService: CardService) {}

    public async createCard(req: Request, res: Response): Promise<void> {
        HandlerRequest.handle(req, res, async () => {
            const user = Validations.requireUser(req.user);
            Validations.requiredField(req.body.cardBaseId, 'Card Base ID');
            Validations.requiredField(req.body.statusCard, 'Status');
            Validations.requiredField(req.file, 'Image');
            const image = req.file;
            const cardData: CreateCardDTO = { 
                ...req.body,
                ownerId: user.userId,
                image: image
            };
            const card = await this.cardService.createCard(cardData);
            return card;
        }, 201, true);
    }

    public async getAllCards(req: Request, res: Response): Promise<void> {
        HandlerRequest.handle(req, res, async () => {
            const filters: CardFilterDTO = {
                name: req.query.name ? (req.query.name as string) : undefined,
                game: req.query.game ? (req.query.game as string) : undefined,
                ownerId: req.query.ownerId as string
            };
        
            const cards = await this.cardService.getAllCards(filters);
            return cards;
        }, 200, true);
    }

    public async getAllCardsPaginated(req: Request, res: Response): Promise<void> {
        HandlerRequest.handle(req, res, async () => {
            const user = Validations.requireUser(req.user);
            const filters: PaginationDTO<CardFilterDTO> = {
                data: {
                    ownerId: user.userId,
                    name: req.query.name ? (req.query.name as string) : undefined,
                    game: req.query.game ? (req.query.game as string) : undefined,
                },
                limit: req.query.limit ? Number(req.query.limit) : undefined,
                offset: req.query.offset ? Number(req.query.offset) : undefined,
            };

            const cards = await this.cardService.getAllCardsPaginated(filters);
            return cards;
        }, 200, true);
    }

    public async getCard(req: Request, res: Response): Promise<void> {
        HandlerRequest.handle(req, res, async () => {
            const id = req.params.id;
            Validations.requiredField(id, 'Card ID');
            const card = await this.cardService.getCard(id)
            return card;
        }, 200, true);
    }

    public async updateCard(req: Request, res: Response): Promise<void> {
        HandlerRequest.handle(req, res, async () => {
            const id = req.params.id;
            Validations.requiredField(id, 'Card ID');
            const user = Validations.requireUser(req.user);
            const cardData : CardUpdatedDTO = {
                ...req.body,
                ownerId: user.userId
            }
            const card = await this.cardService.updateCard(id, cardData);
            return card;
        }, 200, true);
    }

    public async deleteCard(req: Request, res: Response): Promise<void> {
        HandlerRequest.handle(req, res, async () => {
            const id = req.params.id;
            Validations.requiredField(id, 'Card ID');
            const user = Validations.requireUser(req.user);
            const result = await this.cardService.deleteCard(user.userId, id);
            return result;
        }, 204, false);
    }
}


