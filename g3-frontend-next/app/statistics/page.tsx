"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatisticType } from "@/types/statistic"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { getFormattedDate, type TimeGranularity } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchEnhancedStatistics, setSelectedType, setGranularity, setViewType } from "@/lib/statisticSlice"

type ViewType = "punctual" | "accumulated"

export default function StatisticsDashboard() {
  const dispatch = useAppDispatch()
  const { enhancedStatistics, isLoading, error, selectedType, granularity, viewType } = useAppSelector((state) => state.statistics)
  
  const [selectedStatistic, setSelectedStatistic] = useState<StatisticType>(StatisticType.OFFERS_ACCEPTED)
  const [currentGranularity, setCurrentGranularity] = useState<TimeGranularity>("day")
  const [currentViewType, setCurrentViewType] = useState<ViewType>("punctual")

  const statisticOptions = useMemo(
    () => [
      { value: StatisticType.USERS_REGISTERED, label: "Users Registered" },
      { value: StatisticType.USERS_LOGIN, label: "Users Login" },
      { value: StatisticType.CARDS_TOTAL, label: "Cards Total" },
      { value: StatisticType.PUBLICATIONS_TOTAL, label: "Publications Total" },
      { value: StatisticType.OFFERS_TOTAL, label: "Offers Total" },
      { value: StatisticType.OFFERS_ACCEPTED, label: "Offers Accepted" },
      { value: StatisticType.OFFERS_REJECTED, label: "Offers Rejected" },
    ],
    [],
  )

  const fetchStatisticsData = () => {
    dispatch(fetchEnhancedStatistics(selectedStatistic, currentGranularity, currentViewType))
  }

  useEffect(() => {
    fetchStatisticsData()
  }, [selectedStatistic, currentGranularity, currentViewType])

  const handleStatisticChange = (value: StatisticType) => {
    setSelectedStatistic(value)
    dispatch(setSelectedType(value))
  }

  const handleGranularityChange = (value: TimeGranularity) => {
    setCurrentGranularity(value)
    dispatch(setGranularity(value))
  }

  const handleViewTypeChange = (value: string) => {
    const viewType = value as ViewType
    setCurrentViewType(viewType)
    dispatch(setViewType(viewType))
  }

  const chartData = useMemo(() => {
    return enhancedStatistics.map((stat) => ({
      date: getFormattedDate(stat.date, currentGranularity),
      value: stat.amount,
    }))
  }, [enhancedStatistics, currentGranularity])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Statistics Dashboard</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Select value={selectedStatistic} onValueChange={handleStatisticChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Statistic" />
                </SelectTrigger>
                <SelectContent>
                  {statisticOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={currentGranularity} onValueChange={handleGranularityChange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select Granularity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Tabs value={currentViewType} onValueChange={handleViewTypeChange}>
              <TabsList>
                <TabsTrigger value="punctual">Punctual</TabsTrigger>
                <TabsTrigger value="accumulated">Accumulated</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <p>Loading statistics...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={chartData}
                margin={{
                  top: 8,
                  right: 32,
                  left: 24,
                  bottom: 8,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  name={statisticOptions.find((s) => s.value === selectedStatistic)?.label}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 