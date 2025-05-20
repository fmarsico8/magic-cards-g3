import mongoose, { Types, Document, Model } from 'mongoose';
import { BaseModel, IBaseDocument } from './BaseModel';

/**
 * IStatistic: extiende documento base con campos para series temporales
 */
export interface IStatistic extends IBaseDocument {
  timestamp: Date;
  metric: string;
  value: number;
  tags?: Record<string, string>;
}

// Definición del esquema
const statisticsSchemaDefinition = {
  _id: { type: Types.ObjectId, auto: true },
  timestamp: { type: Date, required: true, index: true },
  metric: { type: String, required: true, index: true },
  value: { type: Number, required: true },
  tags: { type: Map, of: String, default: {} }
};


const statisticsSchema = new mongoose.Schema(statisticsSchemaDefinition, {
  collection: 'statistics',
  timeseries: {
    timeField: 'timestamp',
    metaField: 'metric'
  },
  timestamps: true,
  autoIndex: true
});

statisticsSchema.index({ metric: 1, timestamp: 1 });

type StatisticDocument = IStatistic & Document;
const StatisticsModelClass = mongoose.model<StatisticDocument>('Statistic', statisticsSchema);


export class StatisticsModel extends BaseModel<IStatistic> {
  constructor() {
    super(StatisticsModelClass as Model<IStatistic>);
  }

  
  async findByMetricAndTimeRange(
    metric: string,
    startTime: Date,
    endTime: Date
  ): Promise<IStatistic[]> {
    return this.model
      .find({ metric, timestamp: { $gte: startTime, $lte: endTime } })
      .sort({ timestamp: 1 })
      .exec();
  }

  /**
   * Consulta por tags en un rango de fechas
   */
  async findByTagsAndTimeRange(
    tags: Record<string, string>,
    startTime: Date,
    endTime: Date
  ): Promise<IStatistic[]> {
    const filter: any = { timestamp: { $gte: startTime, $lte: endTime } };
    for (const [key, value] of Object.entries(tags)) {
      filter[`tags.${key}`] = value;
    }
    return this.model.find(filter).sort({ timestamp: 1 }).exec();
  }

  /**
   * Agrega métricas por día
   */
  async aggregateMetricsByDay(
    metric: string,
    startTime: Date,
    endTime: Date
  ): Promise<{
    _id: Date;
    avgValue: number;
    minValue: number;
    maxValue: number;
    count: number;
    value: number;
  }[]> {
    return this.model
      .aggregate([
        { $match: { metric, timestamp: { $gte: startTime, $lte: endTime } } },
        {
          $group: {
            _id: { $dateTrunc: { date: '$timestamp', unit: 'day' } },
            avgValue: { $avg: '$value' },
            minValue: { $min: '$value' },
            maxValue: { $max: '$value' },
            value: { $sum: '$value' },
            count: { $sum: 1 }
          }
        },
        {
          $densify: {
            field: '_id',
            range: {
              step: 1,
              unit: 'day',
              bounds: [startTime, endTime]
            }
          }
        },
        {
          $project: {
            _id: 1,
            avgValue: { $ifNull: ['$avgValue', 0] },
            minValue: { $ifNull: ['$minValue', 0] },
            maxValue: { $ifNull: ['$maxValue', 0] },
            value: { $ifNull: ['$value', 0] },
            count: { $ifNull: ['$count', 0] }
          }
        },
        { $sort: { '_id': 1 } }
      ])
      .exec();
  }
}