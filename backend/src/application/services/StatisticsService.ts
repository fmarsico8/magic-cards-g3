import { Statistic } from "../../domain/entities/Stadistics";
import { StatisticsRepository } from "../../domain/repositories/StatisticsRepository";
import {RangeStatisticDTO, StatisticResponseDTO } from "../dtos/StatisticsDTO";
import { userRepository } from "../../infrastructure/provider/Container";
import { UserService } from "./UserService";
import { UnauthorizedException } from "../../domain/entities/exceptions/HttpException";

export class StatisticsService {
    userService : UserService = new UserService(userRepository);
    constructor(private readonly statisticsRepository: StatisticsRepository) {}
    

    public async getRangeStatistics(statisticsDTO:RangeStatisticDTO): Promise<StatisticResponseDTO[]> {
        const user = await this.userService.getSimpleUser(statisticsDTO.userId);
        if(!user.isAdmin())
        {
            throw new UnauthorizedException("Only Admins can view statistics");
        }
        const statistics = await this.statisticsRepository.getRangeStatistics(statisticsDTO.type, statisticsDTO.from, statisticsDTO.to);
        return this.toStatisticDTO(statistics);
    }

    public toStatisticDTO(statistics: Statistic[]): StatisticResponseDTO[] {
        return statistics.map(statistic => ({
            type: statistic.type,
            date: statistic.date,
            amount: statistic.amount
        }));
    }
}
