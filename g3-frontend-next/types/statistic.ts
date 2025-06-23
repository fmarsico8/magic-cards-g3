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

export interface RangeStatisticDTO {
  type: StatisticType
  from: Date
  to: Date
  timePeriod?: TimePeriod
  viewType?: ViewType
}

export interface StatisticResponseDTO {
  type: StatisticType;
  date: Date;
  amount: number;
}

export interface StatisticDTO {
  type: StatisticType;
  date: Date;
  amount: number;
}

