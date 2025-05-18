import { SchemaFactory } from './SchemaFactory';
import { BaseModel, IBaseDocument } from './BaseModel';
import { SchemaTypes } from 'mongoose';
import { Types } from 'mongoose';

export interface ICard extends IBaseDocument {
  ownerId: Types.ObjectId;
  cardBaseId: Types.ObjectId;
  statusCard: number;
  urlImage?: string;
}

const cardSchema = SchemaFactory.createBaseSchema({
  ownerId: { type: SchemaTypes.ObjectId, required: true, ref: 'User' },
  cardBaseId: { type: SchemaTypes.ObjectId, required: true, ref: 'CardBase' },
  statusCard: { type: Number, required: true },
  urlImage: { type: String }
});

const CardModelClass = SchemaFactory.createModel<ICard>('Card', cardSchema);

export class CardModel extends BaseModel<ICard> {
  constructor() {
    super(CardModelClass);
  }
  
  async findByOwnerId(ownerId: string): Promise<ICard[]> {
    return this.model.find({ ownerId }).exec();
  }
}