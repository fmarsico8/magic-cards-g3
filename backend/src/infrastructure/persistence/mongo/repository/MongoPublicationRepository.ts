// infrastructure/repository/MongoPublicationRepository.ts
import { PublicationRepository } from "../../../../domain/repositories/PublicationRepository";
import { Publication } from "../../../../domain/entities/Publication";
import { PublicationModel, IPublication } from "../models/PublicationModel";
import { PublicationMapper } from "../mappers/publication.mapper";
import { PublicationFilterDTO } from "../../../../application/dtos/PublicationDTO";
import { PaginatedResponseDTO, PaginationDTO } from "../../../../application/dtos/PaginationDTO";
import { FilterQuery } from "mongoose";
import { IUser } from "../models/UserModel";
import { ICard } from "../models/CardModel";
import { IOffer } from "../models/OfferModel";
import { IGame } from "../models/GameModel";
import { ICardBase } from "../models/CardBaseModel";

export class MongoPublicationRepository implements PublicationRepository {
  private publicationModel: PublicationModel;

  constructor() {
    this.publicationModel = new PublicationModel();
  }

  async save(publication: Publication): Promise<Publication> {
    const doc = PublicationMapper.toDocument(publication);
    await this.publicationModel.create(doc);
    return publication;
  }

  async update(publication: Publication): Promise<Publication> {
    const doc = PublicationMapper.toDocument(publication);
    await this.publicationModel.update(publication.getId(), doc);
    return publication;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.publicationModel.delete(id);
    return result !== null;
  }

  async findById(id: string): Promise<Publication | null> {
    const doc = await this.publicationModel.findById(id);
    if (!doc) return null;
    
    const populatedDoc = await this.publicationModel.populate(doc, [
      { path: 'ownerId' },
      { path: 'cardId', populate: { path: 'cardBaseId', populate: { path: 'gameId' } } },
      { path: 'cardExchangeIds', populate: { path: 'cardBaseId', populate: { path: 'gameId' } } },
      { path: 'offerIds', populate: { path: 'cardIds', populate: { path: 'cardBaseId', populate: { path: 'gameId' } } } }
    ]) as IPublication & {
      ownerId: IUser;
      cardId: ICard & { cardBaseId: ICardBase & { gameId: IGame }};
      cardExchangeIds: (ICardBase & { gameId: IGame })[];
      offerIds: (IOffer & { cardIds: (ICard & { cardBaseId: ICardBase & { gameId: IGame }})[]})[];
    };

    return PublicationMapper.toEntity(
      populatedDoc, 
      populatedDoc.ownerId, 
      populatedDoc.cardId, 
      populatedDoc.cardExchangeIds, 
      populatedDoc.offerIds);
  }

  async findPaginated(filters: PaginationDTO<PublicationFilterDTO>): Promise<PaginatedResponseDTO<Publication>> {
    const query: FilterQuery<IPublication> = {};
    
    if (filters.data?.status) {
      query.statusPublication = filters.data.status;
    }
    
    if (filters.data?.ownerId) {
      query.ownerId = filters.data.ownerId;
    } else if (filters.data?.excludeId) {
      query.ownerId = { $ne: filters.data.excludeId };
    }
    
    if (filters.data?.initialDate || filters.data?.endDate) {
      query.createdAt = {};
      if (filters.data.initialDate) {
        query.createdAt.$gte = filters.data.initialDate;
      }
      if (filters.data.endDate) {
        query.createdAt.$lte = filters.data.endDate;
      }
    }
    
    if (filters.data?.minValue || filters.data?.maxValue) {
      query.valueMoney = {};
      if (filters.data.minValue) {
        query.valueMoney.$gte = filters.data.minValue;
      }
      if (filters.data.maxValue) {
        query.valueMoney.$lte = filters.data.maxValue;
      }
    }

    const { docs, total } = await this.publicationModel.findPaginatedWithFilters(
      query,
      filters.offset || 0,
      filters.limit || 10
    );

    const populatedDocs = await this.publicationModel.populate(docs, [
      { path: 'ownerId' },
      { path: 'cardId', populate: { path: 'cardBaseId', populate: { path: 'gameId' } } },
      { path: 'cardExchangeIds', populate: { path: 'cardBaseId', populate: { path: 'gameId' } } },
      { path: 'offerIds', populate: { path: 'cardIds', populate: { path: 'cardBaseId', populate: { path: 'gameId' } } } }
    ]) as (IPublication & {
      ownerId: IUser;
      cardId: ICard & { cardBaseId: ICardBase & { gameId: IGame }};
      cardExchangeIds: (ICardBase & { gameId: IGame })[];
      offerIds: (IOffer & { cardIds: (ICard & { cardBaseId: ICardBase & { gameId: IGame }})[]})[];
    })[];

    const publications = populatedDocs.map(doc => 
      PublicationMapper.toEntity(doc, doc.ownerId, doc.cardId, doc.cardExchangeIds, doc.offerIds));

    return {
      data: publications,
      total,
      limit: filters.limit || 10,
      offset: filters.offset || 0,
      hasMore: (filters.offset || 0) + (filters.limit || 10) < total,
    };
  }
}