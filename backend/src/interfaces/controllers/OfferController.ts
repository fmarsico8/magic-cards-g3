import { Request, Response } from 'express';
import { OfferService} from '../../application/services/OfferService';
import { CreateOfferDTO, OfferFilterDTO, OfferUpdatedDTO } from '../../application/dtos/OfferDTO';
import { PaginationDTO } from '../../application/dtos/PaginationDTO';
import { HandlerRequest } from '../../domain/entities/HandlerRequest';
import { Validations } from '../../infrastructure/utils/Validations';

export class OfferController {
    constructor(private readonly offerService: OfferService) {}

    public async createOffer(req: Request, res: Response): Promise<void> {
        HandlerRequest.handle(req, res, async () => {
            const user = Validations.requireUser(req.user);
            Validations.validateId(req.body.publicationId, 'Publication ID');
            const offerData: CreateOfferDTO = {
                ...req.body,
                offerOwnerId: user.userId,   
            };
            const offer = await this.offerService.createOffer(offerData);
            return offer;
        }, 201, true);
    }

    public async getAllOffers(req: Request, res: Response): Promise<void> {
        HandlerRequest.handle(req, res, async () => {
            const filters: OfferFilterDTO = {
                ownerId: req.query.ownerId ? (req.query.ownerId as string) : undefined,
                publicationId: req.query.publicationId ? (req.query.publicationId as string) : undefined,
                status: req.query.status ? (req.query.status as string) : undefined,
            };
            const offers = await this.offerService.getAllOffer(filters);
            return offers;
        }, 200, true);
    }


    public async getAllOffersPaginated(req: Request, res: Response): Promise<void> {
        HandlerRequest.handle(req, res, async () => {
            const filters: PaginationDTO<OfferFilterDTO> = {
                data: {
                    ownerId: req.query.ownerId ? (req.query.ownerId as string) : undefined,
                    publicationId: req.query.publicationId ? (req.query.publicationId as string) : undefined,
                    cardId: req.query.cardId ? (req.query.cardId as string) : undefined,
                    userId: req.query.userId ? (req.query.userId as string) : undefined,
                    status: req.query.status ? (req.query.status as string) : undefined,
                    minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
                    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
                },
                limit: req.query.limit ? Number(req.query.limit) : undefined,
                offset: req.query.offset ? Number(req.query.offset) : undefined,
            };

            const offers = await this.offerService.getAllOfferPaginated(filters);
            return offers;
        }, 200, true);
    }

    public async getOffer(req: Request, res: Response): Promise<void> {
        HandlerRequest.handle(req, res, async () => {
            const id = req.params.id;
            Validations.validateId(id, 'Offer ID');
            const offer = await this.offerService.getOffer(id);
            return offer;
        }, 200, true);
    }

    public async updateOffer(req: Request, res: Response): Promise<void> {
        HandlerRequest.handle(req, res, async () => {
            const id = req.params.id;
            Validations.validateId(id, 'Offer ID');
            const user = Validations.requireUser(req.user);
            const offerData: OfferUpdatedDTO = {
                ...req.body,
                userId: user.userId,   
            };
            const offer = await this.offerService.updateOffer(id, offerData);
            return offer;
        }, 200, true);
    }

    public async deleteOffer(req: Request, res: Response): Promise<void> {
        HandlerRequest.handle(req, res, async () => {
            const id = req.params.id;
            Validations.validateId(id, 'Offer ID');
           // await this.offerService.deleteOffer(id);
        }, 204, false);
    }
}