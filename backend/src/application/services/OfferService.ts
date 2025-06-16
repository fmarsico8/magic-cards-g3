import { Offer } from "../../domain/entities/Offer";
import { OfferRepository } from "../../domain/repositories/OfferRepository";
import { CreateOfferDTO, OfferFilterDTO, OfferResponseDTO, OfferUpdatedDTO } from "../dtos/OfferDTO";  
import { userRepository, publicationRepository, cardRepository, statisticsRepository, notifierService} from "../../infrastructure/provider/Container";
import { Card } from "../../domain/entities/Card";
import { UserService } from "./UserService";
import { StatusOffer } from "../../domain/entities/StatusOffer";
import { Statistic, StatisticType } from "../../domain/entities/Stadistics";
import { PaginatedResponseDTO, PaginationDTO } from "../dtos/PaginationDTO";
import { Validations } from "../../infrastructure/utils/Validations";


export class OfferService {
    userService : UserService = new UserService(userRepository);
    constructor(private readonly offerRepository: OfferRepository) {}

    public async createOffer(offerData: CreateOfferDTO): Promise<OfferResponseDTO> {
        let publication = await publicationRepository.findById(offerData.publicationId);
        publication = Validations.ensureFound(publication, 'Publication');
        let offerOwner = await userRepository.findById(offerData.offerOwnerId);
        offerOwner = Validations.ensureFound(offerOwner, 'Offer owner');

        let cardOffers: Card[] | undefined;       

        if(offerData.cardExchangeIds) {
            cardOffers = await cardRepository.findByCardsByIds(offerData.cardExchangeIds);
            if(cardOffers && cardOffers.length !== offerData.cardExchangeIds.length) {
                Validations.ensureAllIdsFound(cardOffers.map(card => card.getId()), offerData.cardExchangeIds, 'Card');
            }
            if (cardOffers) {
                cardOffers.forEach((card: Card) => card.validateOwnership(offerOwner,"Card"));
            }
        }

        const offer = new Offer({
            offerOwner,
            moneyOffer: offerData.moneyOffer,
            cardOffers, 
            publication
        });

        publication.addOffer(offer);
        await publicationRepository.update(publication);
        await statisticsRepository.increment(new Statistic(StatisticType.OFFERS_TOTAL, new Date(), 1));
        await this.offerRepository.save(offer);

        return this.toOfferResponseDTO(offer);
    }

    public async getAllOffer(filters: OfferFilterDTO): Promise<OfferResponseDTO[]> {
        if(filters.ownerId){
            await this.userService.getSimpleUser(filters.ownerId)
        }
        const offers = await this.offerRepository.find(filters);
        return offers.map(offer => this.toOfferResponseDTO(offer));
    }

    public async getAllOfferPaginated(filters: PaginationDTO<OfferFilterDTO>): Promise<PaginatedResponseDTO<OfferResponseDTO>> {
        if(filters.data.ownerId){
            await this.userService.getSimpleUser(filters.data.ownerId)
        }
        if(filters.data.userId){
            await this.userService.getSimpleUser(filters.data.userId)
        }
        const paginatedOffers = await this.offerRepository.findPaginated(filters);
        return {
            data: paginatedOffers.data.map(offer => this.toOfferResponseDTO(offer)),
            total: paginatedOffers.total,
            limit: paginatedOffers.limit,
            offset: paginatedOffers.offset,
            hasMore: paginatedOffers.hasMore
        };
    }

    public async getOffer(id: string): Promise<OfferResponseDTO | null>{
        let offer = await this.offerRepository.findById(id);
        offer = Validations.ensureFound(offer, 'Offer');
        return this.toOfferResponseDTO(offer);
    }

    public async updateOffer(offerId: string, offerData: OfferUpdatedDTO): Promise<OfferResponseDTO> {
        let offer = await this.offerRepository.findById(offerId);
        offer = Validations.ensureFound(offer, 'Offer');
        const user = await this.userService.getSimpleUser(offerData.userId);
        let publication = await publicationRepository.findById(offerData.publicationId);
        publication = Validations.ensureFound(publication, 'Publication');

        publication.validateOwnership(user, "publication");

        if(offerData.statusOffer === StatusOffer.ACCEPTED) {
            const [offers, cards] = publication.acceptOffer(offer);
            await Promise.all(cards.map(card => cardRepository.update(card)));
            await publicationRepository.update(publication);
            await statisticsRepository.increment(new Statistic(StatisticType.OFFERS_ACCEPTED, new Date(), 1));
            await Promise.all(offers.map((o) => this.offerRepository.update(o)));
            await notifierService.acceptOfferNotify(
                offer.getOfferOwner().getEmail(),
                publication.getCard().getCardBase().getName()
            );
            await notifierService.publicationAcceptedNotify(
                publication.getOwner().getEmail(),
                publication.getCard().getCardBase().getName()
            );
            await Promise.all(
                offers
                  .filter(o => o.getId() !== offer.getId())
                  .map((o) =>
                    notifierService.rejectOfferNotify(
                      o.getOfferOwner().getEmail(),
                      publication.getCard().getCardBase().getName()
                    )
                  )
            );
            return this.toOfferResponseDTO(offer);
        }

        if(offerData.statusOffer === StatusOffer.REJECTED) {
            const rejectedOffer = publication.rejectOffer(offer);
            await publicationRepository.update(publication);
            await statisticsRepository.increment(new Statistic(StatisticType.OFFERS_REJECTED, new Date(), 1));
            await this.offerRepository.update(rejectedOffer);
            await notifierService.rejectOfferNotify(
                offer.getOfferOwner().getEmail(),
                publication.getCard().getCardBase().getName()
            );
            return this.toOfferResponseDTO(rejectedOffer);
        }
        
        await this.offerRepository.update(offer);
        return this.toOfferResponseDTO(offer);
    }

    private toOfferResponseDTO(offer: Offer): OfferResponseDTO {
        const publication = offer.getPublication();
        const publicationId = publication.getId();
        const cardExchangeIds = offer.getCardOffers()?.map(card => card.getId());
        const owner = offer.getOfferOwner();
        const ownerId = owner.getId();

        return {
            id: offer.getId(),
            publicationId,
            publicationName: publication.getCard().getCardBase().getName(),
            moneyOffer: offer.getMoneyOffer(),
            cardExchangeIds,
            createdAt: offer.getCreatedAt(),
            updatedAt: offer.getUpdatedAt(),
            status: offer.getStatusOffer(),
            ownerId: ownerId,
            ownerName: owner.getName()
        };
    }
    

    public async getSimpleOffer(id: string) : Promise<Offer | null> {
        let offer = await this.offerRepository.findById(id);
        offer = Validations.ensureFound(offer, 'Offer');
        return offer;
    }
    
}   
