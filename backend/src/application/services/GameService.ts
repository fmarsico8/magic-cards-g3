import { Game } from '../../domain/entities/Game';
import { GameRepository } from '../../domain/repositories/GameRepository';
import { CreateGameDTO, UpdateGameDTO, GameResponseDTO, GameFilterDTO } from '../dtos/GameDTO';
import { PaginatedResponseDTO, PaginationDTO } from '../dtos/PaginationDTO';
import { Validations } from '../../infrastructure/utils/Validations';

export class GameService {
  constructor(private readonly gameRepository: GameRepository) {}

  public async createGame(gameData: CreateGameDTO): Promise<GameResponseDTO> {
    const normalizedName = Validations.normalizeName(gameData.name);

    const existing = await this.gameRepository.findByName(normalizedName);
    Validations.ensureUniqueName(existing !== undefined, 'Game');

    const game = new Game({
      name: gameData.name,
    });

    const savedGame = await this.gameRepository.save(game);
    return this.toGameResponseDTO(savedGame);
  }

  public async getGame(id: string): Promise<GameResponseDTO> {
    const game = Validations.ensureFound(await this.gameRepository.findById(id), 'Game');
    return this.toGameResponseDTO(game);
  }

  public async getAllGames(): Promise<GameResponseDTO[]> {  
    const games = await this.gameRepository.findAll();
    return games.map(game => this.toGameResponseDTO(game));
  }

  public async getAllGamesPaginated(filters: PaginationDTO<GameFilterDTO>): Promise<PaginatedResponseDTO<GameResponseDTO>> {
    const paginatedGames = await this.gameRepository.findPaginated(filters);
    return {
        data: paginatedGames.data.map(game => this.toGameResponseDTO(game)),
        total: paginatedGames.total,
        limit: paginatedGames.limit,
        offset: paginatedGames.offset,
        hasMore: paginatedGames.hasMore
    };
}

  public async updateGame(id: string, gameData: UpdateGameDTO): Promise<GameResponseDTO> {
    const existingGame = Validations.ensureFound(await this.gameRepository.findById(id), 'Game');
    const newName = gameData.name || existingGame.getName();
    const normalizedNewName = Validations.normalizeName(newName);

    if (normalizedNewName !== existingGame.getName()) {
    const duplicate = await this.gameRepository.findByName(normalizedNewName);
    Validations.ensureUniqueName(duplicate !== undefined, 'Game');
    }
    
    const updatedGame = new Game({
      id: existingGame.getId(),
      name: newName,
    });

    const savedGame = await this.gameRepository.update(updatedGame);
    return this.toGameResponseDTO(savedGame);
  }

  public async deleteGame(id: string): Promise<boolean> {
    Validations.ensureFound(await this.gameRepository.findById(id), 'Game');
    return this.gameRepository.delete(id);
  }

  private toGameResponseDTO(game: Game): GameResponseDTO {
    return {
      id: game.getId(),
      name: game.getName(),
      createdAt: game.getCreatedAt(),
      updatedAt: game.getUpdatedAt(),
    };
  }
} 