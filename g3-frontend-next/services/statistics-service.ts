import { api } from "@/lib/api-client"
import { StatisticResponseDTO, RangeStatisticDTO, StatisticType, TimePeriod, ViewType, StatisticDTO } from "@/types/statistic"

export const statisticsService = {
  getStatistics: async (range: RangeStatisticDTO) => {
    const queryParams = new URLSearchParams()
    
    queryParams.append("type", range.type)
    queryParams.append("from", range.from.toISOString())
    queryParams.append("to", range.to.toISOString())
    
    if (range.timePeriod) {
      queryParams.append("timePeriod", range.timePeriod)
    }
    
    if (range.viewType) {
      queryParams.append("viewType", range.viewType)
    }

    const queryString = queryParams.toString()
    const endpoint = `/statistics?${queryString}`

    return api.get<StatisticResponseDTO[]>(endpoint)
  },
}

export const statisticService = {
  getStatistics: async (
    type: StatisticType,
    from: Date,
    to: Date,
    timePeriod: TimePeriod = TimePeriod.DAY,
    viewType: 'punctual' | 'accumulated' = 'punctual'
  ): Promise<StatisticDTO[]> => {
    const mappedViewType = viewType === 'punctual' ? ViewType.PERIOD_BY_PERIOD : ViewType.ACCUMULATED;
    
    const range: RangeStatisticDTO = {
      type,
      from,
      to,
      timePeriod,
      viewType: mappedViewType
    };
    
    const response = await statisticsService.getStatistics(range);
    
    return response.map(item => ({
      type: item.type,
      date: item.date,
      amount: item.amount
    }));
  }
}
