import { StatisticsRepository } from "../../../../domain/repositories/StatisticsRepository";
import { Statistic, StatisticType, TimePeriod, ViewType } from "../../../../domain/entities/Stadistics";
import { StatisticsModel } from "../models/StatisticsModel";

export class MongoStatisticsRepository implements StatisticsRepository {
  private statisticsModel: StatisticsModel;

  constructor() {
    this.statisticsModel = new StatisticsModel();
  }

  async increment(statistic: Statistic): Promise<void> {
    try {
      const doc = statistic.toTimeseriesFormat();
      await this.statisticsModel.create(doc);
    } catch (error) {
      console.error("Error incrementing statistic:", error);
    }
  }

  async getStatistics(statistic: Statistic): Promise<Statistic> {
    const docs = await this.statisticsModel.findByMetricAndTimeRange(
      statistic.type,
      statistic.date,
      statistic.date
    );
    if (docs.length === 0) {
      return statistic;
    }
    return Statistic.fromTimeseriesFormat(docs[0]);
  }

  async getRangeStatistics(type: StatisticType, startDate: Date, endDate: Date): Promise<Statistic[]> {
    const results = await this.statisticsModel.aggregateMetricsByDay(type.toString(), startDate, endDate);

    return results.map((r: any) => Statistic.fromAggregatedFormat({ ...r, metric: type.toString() }));
  }

  async getRangeStatisticsWithPeriod(
    type: StatisticType, 
    startDate: Date, 
    endDate: Date, 
    timePeriod: TimePeriod = TimePeriod.DAY, 
    viewType: ViewType = ViewType.PERIOD_BY_PERIOD
  ): Promise<Statistic[]> {
    
    if (viewType === ViewType.ACCUMULATED) {
      const results = await this.statisticsModel.getAccumulatedStatistics(
        type.toString(), 
        startDate, 
        endDate, 
        timePeriod
      );
      
      return results.map((r: any) => new Statistic(
        type,
        r._id,
        r.accumulated
      ));
    } else {
      const results = await this.statisticsModel.aggregateMetricsByPeriod(
        type.toString(), 
        startDate, 
        endDate, 
        timePeriod
      );
      
      return results.map((r: any) => Statistic.fromAggregatedFormat({ ...r, metric: type.toString() }));
    }
  }
}