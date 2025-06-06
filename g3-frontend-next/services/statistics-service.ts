import { api } from "@/lib/api-client"
import { StatisticResponseDTO, RangeStatisticDTO } from "@/types/statistic"


export const statisticsService = {
  getStatistics: async (range: RangeStatisticDTO) => {
    const queryParams = new URLSearchParams()
    
    queryParams.append("type", range.type)
    queryParams.append("from", range.from.toISOString())
    queryParams.append("to", range.to.toISOString())

    const queryString = queryParams.toString()
    const endpoint = `/statistics?${queryString}`

    return api.get<StatisticResponseDTO[]>(endpoint)
  },
}
