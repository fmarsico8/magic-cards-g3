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
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            avgValue: { $avg: '$value' },
            minValue: { $min: '$value' },
            maxValue: { $max: '$value' },
            value: { $sum: '$value' },
            count: { $sum: 1 }
          }
        },
        {
          $addFields: {
            _id: { $dateFromString: { dateString: '$_id' } }
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
      ] as any)
      .exec();
  }

  /**
   * Agrega métricas por período especificado (día, mes, trimestre, año)
   */
  async aggregateMetricsByPeriod(
    metric: string,
    startTime: Date,
    endTime: Date,
    timePeriod: 'day' | 'month' | 'quarter' | 'year'
  ): Promise<{
    _id: Date;
    avgValue: number;
    minValue: number;
    maxValue: number;
    count: number;
    value: number;
  }[]> {
    const getGroupExpression = () => {
      switch (timePeriod) {
        case 'day':
          return { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } };
        case 'month':
          return { $dateToString: { format: '%Y-%m', date: '$timestamp' } };
        case 'quarter':
          return {
            $concat: [
              { $dateToString: { format: '%Y', date: '$timestamp' } },
              '-Q',
              {
                $switch: {
                  branches: [
                    { case: { $lte: [{ $month: '$timestamp' }, 3] }, then: '1' },
                    { case: { $lte: [{ $month: '$timestamp' }, 6] }, then: '2' },
                    { case: { $lte: [{ $month: '$timestamp' }, 9] }, then: '3' }
                  ],
                  default: '4'
                }
              }
            ]
          };
        case 'year':
          return { $dateToString: { format: '%Y', date: '$timestamp' } };
        default:
          return { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } };
      }
    };

    const getBounds = () => {
      switch (timePeriod) {
        case 'day':
          return [startTime, endTime];
        case 'month':
          return [new Date(startTime.getFullYear(), startTime.getMonth(), 1), endTime];
        case 'quarter':
          const startQuarter = Math.floor(startTime.getMonth() / 3) * 3;
          return [new Date(startTime.getFullYear(), startQuarter, 1), endTime];
        case 'year':
          return [new Date(startTime.getFullYear(), 0, 1), endTime];
        default:
          return [startTime, endTime];
      }
    };

    const getStep = () => {
      switch (timePeriod) {
        case 'day': return { step: 1, unit: 'day' };
        case 'month': return { step: 1, unit: 'month' };
        case 'quarter': return { step: 3, unit: 'month' };
        case 'year': return { step: 1, unit: 'year' };
        default: return { step: 1, unit: 'day' };
      }
    };

    const stepConfig = getStep();
    const bounds = getBounds();

    return this.model
      .aggregate([
        { $match: { metric, timestamp: { $gte: startTime, $lte: endTime } } },
        {
          $group: {
            _id: getGroupExpression(),
            avgValue: { $avg: '$value' },
            minValue: { $min: '$value' },
            maxValue: { $max: '$value' },
            value: { $sum: '$value' },
            count: { $sum: 1 }
          }
        },
        {
          $addFields: {
            _id: {
              $switch: {
                branches: [
                  {
                    case: { $regexMatch: { input: '$_id', regex: /^[0-9]{4}-Q[1-4]$/ } },
                    then: {
                      $dateFromParts: {
                        year: { $toInt: { $substr: ['$_id', 0, 4] } },
                        month: {
                          $switch: {
                            branches: [
                              { case: { $eq: [{ $substr: ['$_id', 6, 1] }, '1'] }, then: 1 },
                              { case: { $eq: [{ $substr: ['$_id', 6, 1] }, '2'] }, then: 4 },
                              { case: { $eq: [{ $substr: ['$_id', 6, 1] }, '3'] }, then: 7 }
                            ],
                            default: 10
                          }
                        },
                        day: 1
                      }
                    }
                  },
                  {
                    case: { $regexMatch: { input: '$_id', regex: /^[0-9]{4}$/ } },
                    then: {
                      $dateFromParts: {
                        year: { $toInt: '$_id' },
                        month: 1,
                        day: 1
                      }
                    }
                  }
                ],
                default: { $dateFromString: { dateString: '$_id' } }
              }
            }
          }
        },
        {
          $densify: {
            field: '_id',
            range: {
              ...stepConfig,
              bounds
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
      ] as any)
      .exec();
  }

  /**
   * Calcula estadísticas acumulativas
   */
  async getAccumulatedStatistics(
    metric: string,
    startTime: Date,
    endTime: Date,
    timePeriod: 'day' | 'month' | 'quarter' | 'year'
  ): Promise<{
    _id: Date;
    value: number;
    accumulated: number;
  }[]> {
    const periodData = await this.aggregateMetricsByPeriod(metric, startTime, endTime, timePeriod);
    
    let accumulated = 0;
    return periodData.map(item => {
      accumulated += item.value;
      return {
        _id: item._id,
        value: item.value,
        accumulated: accumulated
      };
    });
  }
}