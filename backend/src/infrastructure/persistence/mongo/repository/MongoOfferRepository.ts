import { OfferRepository } from "../../../../domain/repositories/OfferRepository";
import { Offer } from "../../../../domain/entities/Offer";
import { OfferModel, IOffer } from "../models/OfferModel";
import { OfferMapper } from "../mappers/offer.mapper";
import { OfferFilterDTO } from "../../../../application/dtos/OfferDTO";
import { PaginatedResponseDTO, PaginationDTO } from "../../../../application/dtos/PaginationDTO";
import { FilterQuery } from "mongoose";
import { IUser } from "../models/UserModel";
import { ICard } from "../models/CardModel";
import { IPublication } from "../models/PublicationModel";
import { ICardBase } from "../models/CardBaseModel";
import { IGame } from "../models/GameModel";
import { Types } from "mongoose";

export class MongoOfferRepository implements OfferRepository {
  private offerModel: OfferModel;

  constructor() {
    this.offerModel = new OfferModel();
  }

  async save(offer: Offer): Promise<Offer> {
    const doc = OfferMapper.toDocument(offer);
    await this.offerModel.create(doc);
    return offer;
  }

  async update(offer: Offer): Promise<Offer> {
    const doc = OfferMapper.toDocument(offer);
    await this.offerModel.update(offer.getId(), doc);
    return offer;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.offerModel.delete(id);
    return result !== null;
  }

  async findById(id: string, skipPublication = false): Promise<Offer | null> {
    const doc = await this.offerModel.findById(id);
    if (!doc) return null;
    
    const populatedDoc = await this.offerModel.populate(doc, [
      { path: 'offerOwnerId' },
      { 
        path: 'cardIds',                              
        populate: { path: 'cardBaseId', populate: { path: 'gameId' } }              
      },
      ...(skipPublication ? [] : [{ 
        path: 'publicationId',                         
        populate: [
          { path: 'ownerId' },
          { 
            path: 'cardId',
            populate: { path: 'cardBaseId', populate: { path: 'gameId' } }
          }
        ]
      }])
    ]) as IOffer & {
      offerOwnerId: IUser;
      cardIds: (ICard & { cardBaseId: ICardBase & { gameId: IGame }})[];
      publicationId: any;
    };

    return OfferMapper.toEntity(
      populatedDoc,
      populatedDoc.offerOwnerId,
      populatedDoc.cardIds,
      populatedDoc.publicationId
    );
  }

  async findPaginated(filters: PaginationDTO<OfferFilterDTO>): Promise<PaginatedResponseDTO<Offer>> {
    console.log('Filters received:', JSON.stringify(filters, null, 2));
    
    const matchConditions: any = {};
    
    if (filters.data?.userId) {
      matchConditions["publication.ownerId"] = new Types.ObjectId(filters.data.userId);
    }
    if (filters.data?.ownerId) {
      matchConditions.offerOwnerId = new Types.ObjectId(filters.data.ownerId);
    }
    if (filters.data?.status) {
      matchConditions.statusOffer = filters.data.status;
    }
    if (filters.data?.publicationId) {
      matchConditions.publicationId = new Types.ObjectId(filters.data.publicationId);
    }


    const { docs, total } = await this.offerModel.aggregatePaginated({
      lookups: [
        {
          from: "publications",
          localField: "publicationId",
          foreignField: "_id",
          as: "publication",
          unwind: true,
          preserveNullAndEmptyArrays: true
        }
      ],
      match: matchConditions,
      sort: { createdAt: -1 },
      offset: filters.offset || 0,
      limit: filters.limit || 10
    });


    const populatedDocs = await this.offerModel.populate(docs, [
      { path: 'offerOwnerId' },                       
      { 
        path: 'cardIds',                              
        populate: { path: 'cardBaseId', populate: { path: 'gameId' } }              
      },
      { 
        path: 'publicationId',                         
        populate: [
          { path: 'ownerId' },
          { 
            path: 'cardId',
            populate: { path: 'cardBaseId', populate: { path: 'gameId' } }
          }
        ]
      }
    ]) as (IOffer & {
      offerOwnerId: IUser;
      cardIds: (ICard & { cardBaseId: ICardBase & { gameId: IGame }})[];
      publicationId: any;
    })[];

    const offers = populatedDocs.map(doc => 
      OfferMapper.toEntity(doc, doc.offerOwnerId, doc.cardIds, doc.publicationId)
    );

    return {
      data: offers,
      total,
      limit: filters.limit || 10,
      offset: filters.offset || 0,
      hasMore: (filters.offset || 0) + (filters.limit || 10) < total,
    };
  }

  async findByOffersByIds(ids: string[]): Promise<Offer[] | undefined> {
    const docs = await this.offerModel.findByIds(ids);
    if (!docs.length) return undefined;

    const populatedDocs = await this.offerModel.populate(docs, [
      { path: 'offerOwnerId' },                       
      { 
        path: 'cardIds',                              
        populate: { path: 'cardBaseId', populate: { path: 'gameId' } }              
      },
      { 
        path: 'publicationId',                         
        populate: { path: 'cardId' }                   
      }
    ]) as (IOffer & {
      offerOwnerId: IUser;
      cardIds: (ICard & { cardBaseId: ICardBase & { gameId: IGame }})[];
      publicationId: any;
    })[];

    const offers = populatedDocs.map(doc => 
      OfferMapper.toEntity(doc, doc.offerOwnerId, doc.cardIds, doc.publicationId)
    );

    return offers.length ? offers : undefined;
  }
}