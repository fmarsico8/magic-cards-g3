import { Validations } from '../../infrastructure/utils/Validations';
import { CardBase } from '../../domain/entities/CardBase';
import { CardBaseRepository } from '../../domain/repositories/CardBaseRepository';
import { GameRepository } from '../../domain/repositories/GameRepository';
import { CreateCardBaseDTO, UpdateCardBaseDTO, CardBaseResponseDTO, CardBaseFilterDTO } from '../dtos/CardBaseDTO';
import { PaginationDTO, PaginatedResponseDTO } from '../dtos/PaginationDTO';
import { GameService } from './GameService';

export class CardBaseService {
  private gameService: GameService;

  constructor(
    private readonly cardBaseRepository: CardBaseRepository,
    private readonly gameRepository: GameRepository
  ) {
    this.gameService = new GameService(gameRepository);
  }

  public async createCardBase(cardBaseData: CreateCardBaseDTO): Promise<CardBaseResponseDTO> {
    let game = await this.gameRepository.findById(cardBaseData.gameId);
    game = Validations.ensureFound(game, 'Game');
    
    const cardBase = new CardBase({
      game,
      nameCard: cardBaseData.nameCard,
    });

    const savedCardBase = await this.cardBaseRepository.save(cardBase);
    return this.toCardBaseResponseDTO(savedCardBase);
  }

  public async getCardBase(id: string): Promise<CardBaseResponseDTO> {
    let cardBase = await this.cardBaseRepository.findById(id);
    cardBase = Validations.ensureFound(cardBase, 'CardBase');
    return this.toCardBaseResponseDTO(cardBase);
  }

  public async getAllCardBases(gameId?: string): Promise<CardBaseResponseDTO[]> {
    if (gameId) {
      let game = await this.gameRepository.findById(gameId);
      game = Validations.ensureFound(game, 'Game');
      let cardBases = await this.cardBaseRepository.findByGame(game);
      cardBases = cardBases.map(cardBase => Validations.ensureFound(cardBase, 'CardBase'));
      return cardBases.map(cardBase => this.toCardBaseResponseDTO(cardBase));
    }
    
    const cardBases = await this.cardBaseRepository.findAll();
    return cardBases.map(cardBase => this.toCardBaseResponseDTO(cardBase));
  }

  public async getAllCardBasesPaginated(filters: PaginationDTO<CardBaseFilterDTO>): Promise<PaginatedResponseDTO<CardBaseFilterDTO>> {
      const paginatedCards = await this.cardBaseRepository.findPaginated(filters);
      return {
          data: paginatedCards.data.map(cardBase => this.toCardBaseResponseDTO(cardBase)),
          total: paginatedCards.total,
          limit: paginatedCards.limit,
          offset: paginatedCards.offset,
          hasMore: paginatedCards.hasMore
      };
  }

  public async updateCardBase(id: string, cardBaseData: UpdateCardBaseDTO): Promise<CardBaseResponseDTO> {
    let existingCardBase = await this.cardBaseRepository.findById(id);
    existingCardBase = Validations.ensureFound(existingCardBase, 'CardBase');
    let game = existingCardBase.getGame();
    if (cardBaseData.gameId) {
      let newGame = await this.gameRepository.findById(cardBaseData.gameId);
      newGame = Validations.ensureFound(newGame, 'Game');
      game = newGame;
    }
    const updatedCardBase = new CardBase({
      id: existingCardBase.getId(),
      game,
      nameCard: cardBaseData.nameCard || existingCardBase.getName(),
    });

    const savedCardBase = await this.cardBaseRepository.update(updatedCardBase);
    return this.toCardBaseResponseDTO(savedCardBase);
  }

  public async deleteCardBase(id: string): Promise<boolean> {
    let existingCardBase = await this.cardBaseRepository.findById(id);
    existingCardBase = Validations.ensureFound(existingCardBase, 'CardBase');
    return this.cardBaseRepository.delete(id);
  }

  private toCardBaseResponseDTO(cardBase: CardBase): CardBaseResponseDTO {
    return {
      id: cardBase.getId(),
      game: {
        id: cardBase.getGame().getId(),
        name: cardBase.getGame().getName(),
        createdAt: cardBase.getGame().getCreatedAt(),
        updatedAt: cardBase.getGame().getUpdatedAt(),
      },
      nameCard: cardBase.getName(),
      createdAt: cardBase.getCreatedAt(),
      updatedAt: cardBase.getUpdatedAt(),
    };
  }

  public async getSimpleCardBase(id: string): Promise<CardBase> {
    const cardBase = await this.cardBaseRepository.findById(Validations.validateId(id, 'Base Card'));
    return Validations.ensureFound(cardBase, 'Base Card');
  }
} 