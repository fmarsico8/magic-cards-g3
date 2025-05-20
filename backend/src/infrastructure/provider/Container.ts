import { MongoUserRepository } from "../persistence/mongo/repository/MongoUserRepository";
import { MongoGameRepository } from "../persistence/mongo/repository/MongoGameRepository";
import { MongoCardBaseRepository } from "../persistence/mongo/repository/MongoCardBaseRepository";
import { MongoCardRepository } from "../persistence/mongo/repository/MongoCardRepository";
import { MongoPublicationRepository } from "../persistence/mongo/repository/MongoPublicationRepository";
import { MongoOfferRepository } from "../persistence/mongo/repository/MongoOfferRepository";
import { MongoStatisticsRepository } from "../persistence/mongo/repository/MongoStatisticsRepository";

export const userRepository = new MongoUserRepository();
export const publicationRepository = new MongoPublicationRepository();
export const offerRepository = new MongoOfferRepository();
export const cardRepository = new MongoCardRepository();
export const gameRepository = new MongoGameRepository();
export const cardBaseRepository = new MongoCardBaseRepository();
export const statisticsRepository = new MongoStatisticsRepository();
