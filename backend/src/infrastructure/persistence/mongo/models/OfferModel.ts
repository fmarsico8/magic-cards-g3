import { SchemaFactory } from './SchemaFactory';
import { BaseModel, IBaseDocument } from './BaseModel';
import { StatusOffer } from '@/domain/entities/StatusOffer';
import { SchemaTypes } from 'mongoose';
import { Types } from 'mongoose';

export interface IOffer extends IBaseDocument {
  offerOwnerId: Types.ObjectId;
  cardIds: Types.ObjectId[];
  statusOffer: StatusOffer;
  moneyOffer?: number;
  closedAt?: Date;
  publicationId: Types.ObjectId;
}

const offerSchema = SchemaFactory.createBaseSchema({
  offerOwnerId: { type: SchemaTypes.ObjectId, required: true, ref: 'User'  },
  cardIds: [{ type: SchemaTypes.ObjectId, ref: 'Card' }],
  statusOffer: { type: String, enum: ['draft', 'pending', 'accepted', 'rejected'], required: true },
  moneyOffer: { type: Number },
  closedAt: { type: Date },
  publicationId: { type: SchemaTypes.ObjectId, required: true, ref: 'Publication' }
});

const OfferModelClass = SchemaFactory.createModel<IOffer>('Offer', offerSchema);

export class OfferModel extends BaseModel<IOffer> {
  constructor() {
    super(OfferModelClass);
  }
}
