import mongoose, { Types } from "mongoose";
import { CardBase } from "../../../../domain/entities/CardBase";
import { ICardBase } from "../models/CardBaseModel";
import { IGame } from "../models/GameModel";
import { toGameEntity } from "./game.mapper";

export const CardBaseMapper = {
  toDocument(card: CardBase): Partial<ICardBase> {
    return {
      _id: new Types.ObjectId(card.getId()),
      gameId: new Types.ObjectId(card.getGame().getId()),
      nameCard: card.getName()
    };
  },

  toEntity(doc: ICardBase, game: IGame): CardBase {
    return new CardBase({
      id: doc._id.toString(),
      game: toGameEntity(game),
      nameCard: doc.nameCard,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt, 
    });
  },
};
