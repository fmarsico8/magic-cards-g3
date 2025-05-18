import { SchemaFactory } from './SchemaFactory';
import { BaseModel, IBaseDocument } from './BaseModel';
import { StatusPublication } from '@/domain/entities/StatusPublication';
import { SchemaTypes } from 'mongoose';
import { Types } from 'mongoose';

export interface IPublication extends IBaseDocument {
  ownerId: Types.ObjectId;
  cardId: Types.ObjectId;
  valueMoney?: number;
  cardExchangeIds: Types.ObjectId[];
  offerIds: Types.ObjectId[];
  statusPublication: StatusPublication;
}

const publicationSchema = SchemaFactory.createBaseSchema({
  ownerId: { type: SchemaTypes.ObjectId, required: true, ref: 'User' },
  cardId: { type: SchemaTypes.ObjectId, required: true, ref: 'Card' },
  valueMoney: { type: Number },
  cardExchangeIds: [{ type: SchemaTypes.ObjectId, ref: 'CardBase' }],
  offerIds: [{ type: SchemaTypes.ObjectId, ref: 'Offer' }],
  statusPublication: { type: String, enum: ['Open', 'Closed'], required: true }
});

const PublicationModelClass = SchemaFactory.createModel<IPublication>('Publication', publicationSchema);

export class PublicationModel extends BaseModel<IPublication> {
  constructor() {
    super(PublicationModelClass);
  }
  
}
