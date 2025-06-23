export enum StatisticType {
    USERS_REGISTERED = 'users_registered',
    USERS_LOGIN = 'users_login',
    CARDS_TOTAL = 'cards_total',
    OFFERS_TOTAL = 'offers_total',
    PUBLICATIONS_TOTAL = 'publications_total',
    OFFERS_ACCEPTED = 'offers_accepted',
    OFFERS_REJECTED = 'offers_rejected',
}

export enum TimePeriod {
    DAY = 'day',
    MONTH = 'month',
    QUARTER = 'quarter',
    YEAR = 'year'
}

export enum ViewType {
    PERIOD_BY_PERIOD = 'period_by_period',
    ACCUMULATED = 'accumulated'
}

export class Statistic {
    constructor(
      public readonly type: StatisticType,
      public readonly date: Date,
      public readonly amount: number 
    ) {}

    toTimeseriesFormat() {
        return {
            timestamp: this.date,
            metric: this.type,
            value: this.amount
        };
    }

    static fromTimeseriesFormat(data: { timestamp: Date; metric: string; value: number }) {
        return new Statistic(
            data.metric as StatisticType,
            data.timestamp,
            data.value
        );
    }

    static fromAggregatedFormat(data: { 
        _id: Date; 
        avgValue: number; 
        minValue: number; 
        maxValue: number; 
        value: number;
        metric?: string;
    }) {
        return new Statistic(
            data.metric as StatisticType,
            data._id,
            data.value
        );
    }
}
  
  