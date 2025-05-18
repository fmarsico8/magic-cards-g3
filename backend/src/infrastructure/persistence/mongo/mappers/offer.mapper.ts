import { Offer } from "../../../../domain/entities/Offer";
import { Publication } from "../../../../domain/entities/Publication";
import { IOffer } from "../models/OfferModel";
import { Types } from "mongoose";
import { IUser } from "../models/UserModel";
import { ICard } from "../models/CardModel";
import { IPublication } from "../models/PublicationModel";
import { toUserEntity } from "./user.mapper";
import { CardMapper } from "./card.mapper";
import { PublicationMapper } from "./publication.mapper";
import { ICardBase } from "../models/CardBaseModel";
import { IGame } from "../models/GameModel";

export const OfferMapper = {
  toDocument(offer: Offer): Partial<IOffer> {
    return {
      _id: new Types.ObjectId(offer.getId()),
      offerOwnerId: new Types.ObjectId(offer.getOfferOwner().getId()),
      cardIds: offer.getCardOffers()?.map(card => new Types.ObjectId(card.getId())) || [],
      statusOffer: offer.getStatusOffer(),
      moneyOffer: offer.getMoneyOffer(),
      closedAt: offer.getClosedAt(),
      publicationId: new Types.ObjectId(offer.getPublication().getId())
    };
  },

  toEntity(
    doc: IOffer,
    owner: IUser,
    cards: (ICard & { cardBaseId: ICardBase & { gameId: IGame }})[] | undefined,
    publication: any
  ): Offer {
    return new Offer({
      id: doc._id.toString(),
      offerOwner: toUserEntity(owner),
      cardOffers: cards?.map(card => CardMapper.toEntity(card, owner, card.cardBaseId)),
      statusOffer: doc.statusOffer,
      moneyOffer: doc.moneyOffer,
      closedAt: doc.closedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      publication: new Publication({
        id: publication._id.toString(),
        owner: toUserEntity(publication.ownerId),
        card: CardMapper.toEntity(publication.cardId, owner, publication.cardId.cardBaseId),
        createdAt: publication.createdAt,
        updatedAt: publication.updatedAt
      })
    });
  },
};
