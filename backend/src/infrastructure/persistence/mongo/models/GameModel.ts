import { SchemaFactory } from './SchemaFactory';
import { BaseModel, IBaseDocument } from './BaseModel';
import { Types } from 'mongoose';
import { Validations } from '@/infrastructure/utils/Validations';

export interface IGame extends IBaseDocument {
  name: string;
}

const gameSchema = SchemaFactory.createBaseSchema({
  name: { type: String, required: true }
});

const GameModelClass = SchemaFactory.createModel<IGame>('Game', gameSchema);

export class GameModel extends BaseModel<IGame> {
  constructor() {
    super(GameModelClass);
  }
  
  async findByNameRegex(namePattern: string): Promise<IGame[]> {
    return this.model.find({ name: { $regex: namePattern, $options: 'i' } }).exec();
  }
  
  async findPaginatedByName(
    namePattern: string | undefined,
    offset: number = 0,
    limit: number = 10
  ): Promise<{ docs: IGame[]; total: number }> {
    const query = namePattern ? { name: { $regex: namePattern, $options: 'i' } } : {};
    const total = await this.model.countDocuments(query);
    const docs = await this.model.find(query).skip(offset).limit(limit).exec();
    return { docs, total };
  }

  async findByName(name: string): Promise<IGame | undefined> {
    const doc = await this.model.findOne({ name: name }).exec();
    return doc ?? undefined;
  }
}