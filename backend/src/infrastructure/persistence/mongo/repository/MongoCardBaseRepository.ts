import { CardBaseRepository } from "../../../../domain/repositories/CardBaseRepository";
import { CardBase } from "../../../../domain/entities/CardBase";
import { Game } from "../../../../domain/entities/Game";
import { CardBaseFilterDTO } from "../../../../application/dtos/CardBaseDTO";
import { PaginationDTO, PaginatedResponseDTO } from "../../../../application/dtos/PaginationDTO";
import { CardBaseModel, ICardBase } from "../models/CardBaseModel";
import { CardBaseMapper } from "../mappers/cardBase.mapper";
import { gameRepository } from "../../../../infrastructure/provider/Container";
import { CardMapper } from "../mappers/card.mapper";
import { ICard } from "../models/CardModel";
import { User } from "@/domain/entities/User";
import { IGame } from "../models/GameModel";

export class MongoCardBaseRepository implements CardBaseRepository {
  private cardBaseModel: CardBaseModel;

  constructor() {
    this.cardBaseModel = new CardBaseModel();
  }

  async save(card: CardBase): Promise<CardBase> {
    const doc = CardBaseMapper.toDocument(card);
    await this.cardBaseModel.create(doc);
    return card;
  }

  async update(card: CardBase): Promise<CardBase> {
    const doc = CardBaseMapper.toDocument(card);
    await this.cardBaseModel.update(card.getId(), doc);
    return card;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.cardBaseModel.delete(id);
    return result !== null;
  }

  async findById(id: string): Promise<CardBase | undefined> {
    const doc = await this.cardBaseModel.findById(id);
    if (!doc) return undefined;
    const populatedDoc = await this.cardBaseModel.populate(doc, { path: 'gameId' }) as (ICardBase & { gameId: IGame });
    return CardBaseMapper.toEntity(populatedDoc, populatedDoc.gameId);
  }

  async findByCardsByIds(ids: string[]): Promise<CardBase[] | undefined> {
    const docs = await this.cardBaseModel.findByIds(ids);
    if (!docs.length) return undefined;
    
    const populatedDocs = await this.cardBaseModel.populate(docs, { path: 'gameId' }) as (ICardBase & { gameId: IGame })[];
    return populatedDocs.map(doc => CardBaseMapper.toEntity(doc, doc.gameId));
  }

  async findByGame(game: Game): Promise<CardBase[]> {
    const docs = await this.cardBaseModel.findByGameId(game.getId());
    const populatedDocs = await this.cardBaseModel.populate(docs, { path: 'gameId' }) as (ICardBase & { gameId: IGame })[];
    return populatedDocs.map(doc => CardBaseMapper.toEntity(doc, doc.gameId));
  }

  async findPaginated(filters: PaginationDTO<CardBaseFilterDTO>): Promise<PaginatedResponseDTO<CardBase>> {
    const { docs, total } = await this.cardBaseModel.findPaginatedWithFilters(
      {
        gameId: filters.data?.gameId,
        nameCard: filters.data?.nameCard
      },
      filters.offset || 0,
      filters.limit || 10
    );

    console.log(docs);
    const populatedDocs = await this.cardBaseModel.populate(docs, { path: 'gameId' }) as (ICardBase & { gameId: IGame })[];

    console.log(populatedDocs);
    const cards = populatedDocs.map(doc => CardBaseMapper.toEntity(doc, doc.gameId));

    return {
      data: cards,
      total,
      limit: filters.limit || 10,
      offset: filters.offset || 0,
      hasMore: (filters.offset || 0) + (filters.limit || 10) < total,
    };
  }
}