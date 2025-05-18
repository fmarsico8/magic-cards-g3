import { CardRepository } from "../../../../domain/repositories/CardRepository";
import { Card } from "../../../../domain/entities/Card";
import { CardModel, ICard } from "../models/CardModel";
import { CardMapper } from "../mappers/card.mapper";
import { PaginationDTO, PaginatedResponseDTO } from "../../../../application/dtos/PaginationDTO";
import { CardFilterDTO } from "../../../../application/dtos/CardsDTO";
import { User } from "../../../../domain/entities/User";
import { CardBase } from "../../../../domain/entities/CardBase";
import { Game } from "@/domain/entities/Game";
import { IUser } from "../models/UserModel";
import { ICardBase } from "../models/CardBaseModel";
import { IGame } from "../models/GameModel";

export class MongoCardRepository implements CardRepository {
  private cardModel: CardModel;

  constructor() {
    this.cardModel = new CardModel();
  }

  async save(card: Card): Promise<Card> {
    const doc = CardMapper.toDocument(card);
    await this.cardModel.create(doc);
    return card;
  }

  async update(card: Card): Promise<Card> {
    const doc = CardMapper.toDocument(card);
    await this.cardModel.update(card.getId(), doc);
    return card;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.cardModel.delete(id);
    return result !== null;
  }

  async findById(id: string): Promise<Card> {
    const doc = await this.cardModel.findById(id);
    if (!doc) throw new Error(`Card not found (id: ${id})`);
    
    const populatedDoc = await this.cardModel.populate(doc, [
      { path: 'ownerId' },
      {
        path: 'cardBaseId',
        populate: {
          path: 'gameId',
          model: 'Game'
        }
      }
    ]) as ICard & { ownerId: IUser; cardBaseId: ICardBase & { gameId: IGame } };
    
    return CardMapper.toEntity(populatedDoc, populatedDoc.ownerId, populatedDoc.cardBaseId);
  }


  async findPaginated(filters: PaginationDTO<CardFilterDTO>): Promise<PaginatedResponseDTO<Card>> {
    const query: any = {};
    if (filters.data?.ownerId) {
      query.ownerId = filters.data.ownerId;
    }
    
    const { docs, total } = await this.cardModel.findPaginatedWithFilters(
      query,
      filters.offset || 0,
      filters.limit || 10
    );

    const populatedDocs = await this.cardModel.populate(docs, [
      { path: 'ownerId' },
      {
        path: 'cardBaseId',
        populate: {
          path: 'gameId',
          model: 'Game'
        }
      }
    ]) as (ICard & { ownerId: IUser; cardBaseId: ICardBase & { gameId: IGame } })[];

    const cards = populatedDocs.map(doc => 
      CardMapper.toEntity(doc, doc.ownerId, doc.cardBaseId)
    );

    return {
      data: cards,
      total,
      limit: filters.limit || 10,
      offset: filters.offset || 0,
      hasMore: (filters.offset || 0) + (filters.limit || 10) < total,
    };
  }

  async findByCardsByIds(ids: string[]): Promise<Card[] | undefined> {
    const docs = await this.cardModel.findByIds(ids);
    if (!docs.length) return undefined;

    const populatedDocs = await this.cardModel.populate(docs, [
      { path: 'ownerId' },
      {
        path: 'cardBaseId',
        populate: {
          path: 'gameId',
          model: 'Game'
        }
      }
    ]) as (ICard & { ownerId: IUser; cardBaseId: ICardBase & { gameId: IGame } })[];

    const cards = populatedDocs.map(doc => 
      CardMapper.toEntity(doc, doc.ownerId, doc.cardBaseId)
    );

    return cards.length > 0 ? cards : undefined;
  }
}
