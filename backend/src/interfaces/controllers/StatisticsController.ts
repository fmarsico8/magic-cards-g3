import { Request, Response } from 'express';
import { StatisticsService } from '../../application/services/StatisticsService';
import { StatisticType, TimePeriod, ViewType } from '../../domain/entities/Stadistics';
import { RangeStatisticDTO } from '@/application/dtos/StatisticsDTO';

export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) {}

    public async getRangeStatistics(req: Request, res: Response): Promise<void> {
        const statisticsDTO: RangeStatisticDTO = {
            userId: req.user?.userId || "",
            type: req.query.type ? req.query.type as StatisticType : StatisticType.USERS_REGISTERED,
            from: req.query.from ? new Date(req.query.from as string) : new Date(),
            to: req.query.to ? new Date(req.query.to as string) : new Date(),
            timePeriod: req.query.timePeriod ? req.query.timePeriod as TimePeriod : TimePeriod.DAY,
            viewType: req.query.viewType ? req.query.viewType as ViewType : ViewType.PERIOD_BY_PERIOD
        }
        
        const rangeStatistics = await this.statisticsService.getRangeStatistics(statisticsDTO);
        res.status(200).json(rangeStatistics);
    }
    
}