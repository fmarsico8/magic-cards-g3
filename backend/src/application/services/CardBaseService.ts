import { CardBase } from '../../domain/entities/CardBase';
import { CardBaseRepository } from '../../domain/repositories/CardBaseRepository';
import { GameRepository } from '../../domain/repositories/GameRepository';
import { CreateCardBaseDTO, UpdateCardBaseDTO, CardBaseResponseDTO, CardBaseFilterDTO } from '../dtos/CardBaseDTO';
import { PaginationDTO, PaginatedResponseDTO } from '../dtos/PaginationDTO';

export class CardBaseService {

  constructor(
    private readonly cardBaseRepository: CardBaseRepository,
    private readonly gameRepository: GameRepository
  ) {
  }

  public async createCardBase(cardBaseData: CreateCardBaseDTO): Promise<CardBaseResponseDTO> {
    const game = await this.gameRepository.findById(cardBaseData.gameId);
    
    if (!game) {
      throw new Error('Game not found');
    }

    const cardBase = new CardBase({
      game,
      nameCard: cardBaseData.nameCard,
    });

    const savedCardBase = await this.cardBaseRepository.save(cardBase);
    return this.toCardBaseResponseDTO(savedCardBase);
  }

  public async getCardBase(id: string): Promise<CardBaseResponseDTO> {
    const cardBase = await this.cardBaseRepository.findById(id);
    
    if (!cardBase) {
      throw new Error('CardBase not found');
    }
    
    return this.toCardBaseResponseDTO(cardBase);
  }

  public async getAllCardBases(): Promise<CardBaseResponseDTO[]> {
    const cardBases = await this.cardBaseRepository.findPaginated({ data: {}, limit: 100, offset: 0 });
    return cardBases.data.map(cardBase => this.toCardBaseResponseDTO(cardBase));
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
    const existingCardBase = await this.cardBaseRepository.findById(id);
    
    if (!existingCardBase) {
      throw new Error('CardBase not found');
    }

    let game = existingCardBase.getGame();
    
    if (cardBaseData.gameId) {
      const newGame = await this.gameRepository.findById(cardBaseData.gameId);
      if (!newGame) {
        throw new Error('Game not found');
      }
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
    const existingCardBase = await this.cardBaseRepository.findById(id);
    
    if (!existingCardBase) {
      throw new Error('CardBase not found');
    }

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
    const cardBase = await this.cardBaseRepository.findById(id);
    if (!cardBase) throw new Error("Base Card not found");
    return cardBase;
  }
} 