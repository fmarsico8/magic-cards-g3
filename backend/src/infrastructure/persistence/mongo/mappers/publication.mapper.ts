import { Publication } from "../../../../domain/entities/Publication";
import { IPublication } from "../models/PublicationModel";
import { Types } from "mongoose";
import { toUserEntity } from "./user.mapper";
import { CardBaseMapper } from "./cardBase.mapper";
import { ICard } from "../models/CardModel";
import { IUser } from "../models/UserModel";
import { ICardBase } from "../models/CardBaseModel";
import { IOffer } from "../models/OfferModel";
import { OfferMapper } from "./offer.mapper";
import { CardMapper } from "./card.mapper";
import { IGame } from "../models/GameModel";
export const PublicationMapper = {
  toDocument(pub: Publication): Partial<IPublication> {
    return {
      _id: new Types.ObjectId(pub.getId()),
      ownerId: new Types.ObjectId(pub.getOwner().getId()),
      cardId: new Types.ObjectId(pub.getCard().getId()),
      cardExchangeIds: pub.getCardExchange()?.map(cb => new Types.ObjectId(cb.getId())) || [],
      offerIds: pub.getOffersExisting()?.map(o => new Types.ObjectId(o.getId())) || [],
      valueMoney: pub.getValueMoney(),
      statusPublication: pub.getStatusPublication()
    };
  },

  toEntity(doc: IPublication, owner: IUser, 
    card: ICard & { cardBaseId: ICardBase & { gameId: IGame }}, 
    cardExchange: (ICardBase & { gameId: IGame })[], 
    offers: (IOffer & { cardIds: (ICard & { cardBaseId: ICardBase & { gameId: IGame }})[]})[]): Publication {
    return new Publication({
      id: doc._id.toString(), 
      statusPublication: doc.statusPublication,
      owner: toUserEntity(owner),
      card: CardMapper.toEntity(card, owner, card.cardBaseId),
      cardExchange: cardExchange.map(cb => CardBaseMapper.toEntity(cb, cb.gameId)),
      offersExisting: offers.map(o => OfferMapper.toEntity(o, owner, o.cardIds, doc)),
      valueMoney: doc.valueMoney,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }
};
