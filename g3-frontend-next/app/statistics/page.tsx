"use client"
import { useState, useEffect } from 'react';
import { StatisticType } from '@/types/statistic';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchStatistics, setSelectedType } from '@/lib/statisticSlice';

export default function StatisticsPage() {
  const dispatch = useAppDispatch();
  const { statistics, isLoading, error } = useAppSelector((state) => state.statistics);
  const [selectedStatistic, setSelectedStatistic] = useState<StatisticType>(StatisticType.USERS_REGISTERED);

  useEffect(() => {
    const from = new Date();
    from.setDate(from.getDate() - 30); 
    const to = new Date();

    dispatch(fetchStatistics({
      type: selectedStatistic,
      from,
      to,
    }));
  }, [dispatch, selectedStatistic]);

  const handleStatisticChange = (value: StatisticType) => {
    setSelectedStatistic(value);
    dispatch(setSelectedType(value));
  };

  const currentData = statistics[selectedStatistic] || [];

  // Format the data for the chart
  const formattedData = currentData.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString(),
    value: item.amount
  }));

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Statistics Dashboard</h1>
      
      <div className="mb-6">
        <Select
          value={selectedStatistic}
          onValueChange={handleStatisticChange}
        >
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select statistic type" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(StatisticType).map((type) => (
              <SelectItem key={type} value={type}>
                {type.replace(/_/g, ' ').toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedStatistic.replace(/_/g, ' ').toLowerCase()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-[400px]">
              Loading...
            </div>
          ) : (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString(), 'Value']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={selectedStatistic.replace(/_/g, ' ').toLowerCase()}
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 