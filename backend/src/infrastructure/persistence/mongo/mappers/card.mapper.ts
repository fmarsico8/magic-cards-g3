import mongoose, { Types } from "mongoose";
import { Card } from "../../../../domain/entities/Card";
import { CardBase } from "../../../../domain/entities/CardBase";
import { User } from "../../../../domain/entities/User";
import { ICard } from "../models/CardModel";
import { Game } from "@/domain/entities/Game";
import { toUserEntity } from "./user.mapper";
import { CardBaseMapper } from "./cardBase.mapper";
import { IUser } from "../models/UserModel";
import { ICardBase } from "../models/CardBaseModel";
import { IGame } from "../models/GameModel";

export const CardMapper = {
  toDocument(card: Card): Partial<ICard> {
    return {
      _id: new Types.ObjectId(card.getId()),
      cardBaseId: new Types.ObjectId(card.getCardBase().getId()),
      ownerId: new Types.ObjectId(card.getOwner().getId()),
      statusCard: card.getStatusCard(),
      urlImage: card.getUrlImage()
    };
  },

  toEntity(doc: ICard, owner: IUser, cardBase: ICardBase & { gameId: IGame }): Card {
    return new Card({
      id: doc._id.toString(),
      owner: toUserEntity(owner),
      cardBase: CardBaseMapper.toEntity(cardBase, cardBase.gameId),
      statusCard: doc.statusCard,
      urlImage: doc.urlImage,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  },
};
