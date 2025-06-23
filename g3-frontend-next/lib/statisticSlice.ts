import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { StatisticResponseDTO, StatisticType, TimePeriod, StatisticDTO, type RangeStatisticDTO } from "@/types/statistic"
import { statisticsService, statisticService } from "@/services/statistics-service"
import { subDays, subMonths, subQuarters, subYears, type TimeGranularity } from "@/lib/utils"
import Promise from "bluebird"

interface StatisticsState {
  statistics: Record<StatisticType, StatisticResponseDTO[]>
  enhancedStatistics: StatisticDTO[]
  isLoading: boolean
  error: string | null
  selectedType: StatisticType | null
  granularity: TimeGranularity
  viewType: 'punctual' | 'accumulated'
}

const initialState: StatisticsState = {
  statistics: {
    [StatisticType.USERS_REGISTERED]: [],
    [StatisticType.USERS_LOGIN]: [],
    [StatisticType.CARDS_TOTAL]: [],
    [StatisticType.OFFERS_TOTAL]: [],
    [StatisticType.PUBLICATIONS_TOTAL]: [],
    [StatisticType.OFFERS_ACCEPTED]: [],
    [StatisticType.OFFERS_REJECTED]: [],
  },
  enhancedStatistics: [],
  isLoading: false,
  error: null,
  selectedType: null,
  granularity: 'day',
  viewType: 'punctual',
}

export const statisticSlice = createSlice({
  name: "statistics",
  initialState,
  reducers: {
    fetchStatisticsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchStatisticsSuccess: (
      state,
      action: PayloadAction<{ type: StatisticType; data: StatisticResponseDTO[] }>
    ) => {
      const { type, data } = action.payload
      state.statistics[type] = data
      state.selectedType = type
      state.isLoading = false
    },
    fetchEnhancedStatisticsSuccess: (
      state,
      action: PayloadAction<StatisticDTO[]>
    ) => {
      state.enhancedStatistics = action.payload
      state.isLoading = false
    },
    fetchStatisticsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    setSelectedType: (state, action: PayloadAction<StatisticType>) => {
      state.selectedType = action.payload
    },
    setGranularity: (state, action: PayloadAction<TimeGranularity>) => {
      state.granularity = action.payload
    },
    setViewType: (state, action: PayloadAction<'punctual' | 'accumulated'>) => {
      state.viewType = action.payload
    },
  },
})

export const {
  fetchStatisticsStart,
  fetchStatisticsSuccess,
  fetchEnhancedStatisticsSuccess,
  fetchStatisticsFailure,
  setSelectedType,
  setGranularity,
  setViewType,
} = statisticSlice.actions

export default statisticSlice.reducer

// Helper function to determine date range based on granularity
const getDateRange = (granularity: TimeGranularity) => {
  const now = new Date()
  let fromDate: Date

  switch (granularity) {
    case "day":
      fromDate = subDays(now, 90) // Last 90 days (3 months)
      break
    case "month":
      fromDate = subMonths(now, 24) // Last 24 months (2 years)
      break
    case "quarter":
      fromDate = subQuarters(now, 12) // Last 12 quarters (3 years)
      break
    case "year":
      fromDate = subYears(now, 10) // Last 10 years
      break
    default:
      fromDate = subDays(now, 90)
  }

  return { fromDate, toDate: now }
}

// Map TimeGranularity to TimePeriod
const mapGranularityToPeriod = (granularity: TimeGranularity): TimePeriod => {
  switch (granularity) {
    case "day": return TimePeriod.DAY
    case "month": return TimePeriod.MONTH
    case "quarter": return TimePeriod.QUARTER
    case "year": return TimePeriod.YEAR
    default: return TimePeriod.DAY
  }
}

// Thunks
export const fetchStatistics = (range: RangeStatisticDTO) => async (dispatch: any) => {
  dispatch(fetchStatisticsStart())

  try {
    const data = await Promise.resolve(statisticsService.getStatistics(range))
    dispatch(
      fetchStatisticsSuccess({
        type: range.type,
        data,
      })
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load statistics"
    dispatch(fetchStatisticsFailure(message))
  }
}

export const fetchEnhancedStatistics = (
  selectedStatistic: StatisticType,
  granularity: TimeGranularity,
  viewType: 'punctual' | 'accumulated'
) => async (dispatch: any) => {
  dispatch(fetchStatisticsStart())

  try {
    const { fromDate, toDate } = getDateRange(granularity)
    
    const data = await statisticService.getStatistics(
      selectedStatistic,
      fromDate,
      toDate,
      mapGranularityToPeriod(granularity),
      viewType
    )
    
    dispatch(fetchEnhancedStatisticsSuccess(data))
  } catch (error) {
    console.error("Failed to fetch statistics:", error)
    const message = error instanceof Error ? error.message : "Failed to load statistics"
    dispatch(fetchStatisticsFailure(message))
  }
}
