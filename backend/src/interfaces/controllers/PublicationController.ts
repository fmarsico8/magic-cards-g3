import { Request, Response } from 'express';
import { CreatePublicationDTO, PublicationFilterDTO, PublicationUpdatedDTO } from "../../application/dtos/PublicationDTO";
import { PublicationService } from "../../application/services/PublicationService";
import { PaginationDTO } from '../../application/dtos/PaginationDTO';
import { HandlerRequest } from './HandlerRequest';
import { Validations } from '../../infrastructure/utils/Validations';

export class PublicationController {
    constructor(private readonly publicationService: PublicationService) {}

    public async createPublication(req: Request, res: Response): Promise<void> {
        HandlerRequest.handle(req, res, async () => {
            const userId = Validations.requireUser(req.user).userId;
            Validations.requiredField(req.body.cardId, 'Card ID');
            const publicationData: CreatePublicationDTO = { 
                ...req.body,
                ownerId: userId,
            };
            const publication = await this.publicationService.createPublication(publicationData);
            return publication;
        }, 201, true);
    }

    public async getAllPublications(req: Request, res: Response): Promise<void> {
        HandlerRequest.handle(req, res, async () => {
            const filters: PublicationFilterDTO = {
                gamesIds: req.query.gamesIds ? (req.query.gamesIds as string).split(',') : undefined,
                status: req.query.status ? (req.query.status as string) : undefined,
                cardBaseIds: req.query.cardBaseIds ? (req.query.cardBaseIds as string).split(',') : undefined,              
                ownerId: (req.query.ownerId as string) || undefined,
                initialDate: req.query.initialDate ? new Date(req.query.initialDate as string) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
                minValue: req.query.minValue ? Number(req.query.minValue) : undefined,
                maxValue: req.query.maxValue ? Number(req.query.maxValue) : undefined,
            };
        
            const publications = await this.publicationService.getAllPublications(filters);
            return publications;
        }, 200, true);
    }

    public async getAllPublicationsPaginated(req: Request, res: Response): Promise<void> {
        HandlerRequest.handle(req, res, async () => {
            const filters: PaginationDTO<PublicationFilterDTO> = {
                data: {
                    initialDate: req.query.initialDate ? new Date(req.query.initialDate as string) : undefined,
                    endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
                    gamesIds: req.query.gamesIds ? (req.query.gamesIds as string).split(',') : undefined,
                    cardBaseIds: req.query.cardBaseIds ? (req.query.cardBaseIds as string).split(',') : undefined,
                    ownerId: req.query.ownerId ? (req.query.ownerId as string) : undefined,
                    minValue: req.query.minValue ? Number(req.query.minValue) : undefined,
                    maxValue: req.query.maxValue ? Number(req.query.maxValue) : undefined,
                    excludeId: req.query.excludeId ? (req.query.excludeId as string) : undefined,
                    status: req.query.status ? (req.query.status as string) : undefined,
                },
                limit: req.query.limit ? Number(req.query.limit) : undefined,
                offset: req.query.offset ? Number(req.query.offset) : undefined,
            };

            const publications = await this.publicationService.getAllPublicationsPaginated(filters);
            return publications;
        }, 200, true);
    }

    public async getPublication(req: Request, res: Response): Promise<void> {
        HandlerRequest.handle(req, res, async () => {
            const id = req.params.id;
            Validations.validateId(id, 'Publication ID');
            const publication = await this.publicationService.getPublication(id)
            return publication;
        }, 200, true);
    }

    public async updatePublication(req: Request, res: Response): Promise<void> {
        HandlerRequest.handle(req, res, async () => {
            const userId = Validations.requireUser(req.user).userId;
            const id = req.params.id;
            Validations.validateId(id, 'Publication ID');
            const publicationData : PublicationUpdatedDTO = {
                ...req.body,
                userId
            }
            const publication = await this.publicationService.updatePublication(id, publicationData)
            return publication;
        }, 200, true);
    }

    public async deletePublication(req: Request, res: Response): Promise<void> {
        HandlerRequest.handle(req, res, async () => {
            const userId = Validations.requireUser(req.user).userId;
            const id = req.params.id;
            Validations.validateId(id, 'Publication ID');
            await this.publicationService.deletePublication(userId,id)
            return;
        }, 204, false);
    }
}


