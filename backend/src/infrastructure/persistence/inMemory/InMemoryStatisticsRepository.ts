import { StatisticsRepository } from "../../../domain/repositories/StatisticsRepository";
import { Statistic, StatisticType, TimePeriod, ViewType } from "../../../domain/entities/Stadistics";
type Key = string; // "offers_closed-2024-04-10"

export class InMemoryStatisticsRepository implements StatisticsRepository {
  private stats: Map<Key, number> = new Map();

  private buildKey(type: string, date: Date): string {
    return `${type}-${date.toISOString().split('T')[0]}`; // yyyy-mm-dd
  }

  async increment(statistic: Statistic): Promise<void> {
    const key = this.buildKey(statistic.type, statistic.date);
    const current = this.stats.get(key) ?? 0;
    this.stats.set(key, current + statistic.amount);
  } 

  async getStatistics(statistic: Statistic): Promise<Statistic> {
    const key = this.buildKey(statistic.type, statistic.date);
    return new Statistic(statistic.type, statistic.date, this.stats.get(key) ?? 0);
  }

  async getRangeStatistics(type: StatisticType, from: Date, to: Date): Promise<Statistic[]> {
    const results: Statistic[] = [];

    const current = new Date(from);
    while (current <= to) {
      const key = this.buildKey(type, current);
      results.push(new Statistic(type, new Date(current), this.stats.get(key) ?? 0));
      current.setDate(current.getDate() + 1);
    }

    return results;
  }

  async getRangeStatisticsWithPeriod(
    type: StatisticType, 
    startDate: Date, 
    endDate: Date, 
    timePeriod: TimePeriod, 
    viewType: ViewType
  ): Promise<Statistic[]> {
    const results: Statistic[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      let periodValue = 0;
      const periodStart = new Date(current);
      
      // Calculate period end based on TimePeriod
      const periodEnd = new Date(current);
      switch (timePeriod) {
        case TimePeriod.DAY:
          // Already set to current day
          break;
        case TimePeriod.MONTH:
          periodEnd.setMonth(periodEnd.getMonth() + 1);
          periodEnd.setDate(0); // Last day of month
          break;
        case TimePeriod.QUARTER:
          const quarterMonth = Math.floor(periodEnd.getMonth() / 3) * 3;
          periodEnd.setMonth(quarterMonth + 3);
          periodEnd.setDate(0); // Last day of quarter
          break;
        case TimePeriod.YEAR:
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
          periodEnd.setDate(0); // Last day of year
          break;
      }
      
      // Don't exceed the requested end date
      if (periodEnd > endDate) {
        periodEnd.setTime(endDate.getTime());
      }
      
      // Sum values for the period
      const tempDate = new Date(periodStart);
      while (tempDate <= periodEnd) {
        const key = this.buildKey(type, tempDate);
        periodValue += this.stats.get(key) ?? 0;
        tempDate.setDate(tempDate.getDate() + 1);
      }
      
      results.push(new Statistic(type, new Date(periodStart), periodValue));
      
      // Move to next period
      switch (timePeriod) {
        case TimePeriod.DAY:
          current.setDate(current.getDate() + 1);
          break;
        case TimePeriod.MONTH:
          current.setMonth(current.getMonth() + 1);
          current.setDate(1);
          break;
        case TimePeriod.QUARTER:
          current.setMonth(current.getMonth() + 3);
          current.setDate(1);
          break;
        case TimePeriod.YEAR:
          current.setFullYear(current.getFullYear() + 1);
          current.setMonth(0);
          current.setDate(1);
          break;
      }
    }
    
    // Apply ViewType logic
    if (viewType === ViewType.ACCUMULATED) {
      let accumulated = 0;
      return results.map(stat => {
        accumulated += stat.amount;
        return new Statistic(stat.type, stat.date, accumulated);
      });
    }
    
    return results;
  }
}
