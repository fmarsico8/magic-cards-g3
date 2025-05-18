import { Game } from '../../domain/entities/Game';
import { GameRepository } from '../../domain/repositories/GameRepository';
import { GameService } from '../../application/services/GameService';
import { CreateGameDTO, UpdateGameDTO, GameFilterDTO } from '../../application/dtos/GameDTO';
import { PaginationDTO } from '@/application/dtos/PaginationDTO';

describe('GameService', () => {
  let gameRepository: jest.Mocked<GameRepository>;
  let gameService: GameService;
  let mockGame: Game;

  beforeEach(() => {
    // Create a mock game
    mockGame = new Game({ name: 'Test Game' });

    // Mock the repository
    gameRepository = {
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findPaginated: jest.fn()
    } as jest.Mocked<GameRepository>;

    // Create the service with the mocked repository
    gameService = new GameService(gameRepository);
  });

  describe('createGame', () => {
    it('should create a new game', async () => {
      // Arrange
      const gameData: CreateGameDTO = { name: 'New Game' };
      gameRepository.save.mockResolvedValue(new Game(gameData));

      // Act
      const result = await gameService.createGame(gameData);

      // Assert
      expect(gameRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(gameData.name);
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });
  });

  describe('getGame', () => {
    it('should return a game by id', async () => {
      // Arrange
      const gameId = mockGame.getId();
      gameRepository.findById.mockResolvedValue(mockGame);

      // Act
      const result = await gameService.getGame(gameId);

      // Assert
      expect(gameRepository.findById).toHaveBeenCalledWith(gameId);
      expect(result).toHaveProperty('id', gameId);
      expect(result.name).toBe(mockGame.getName());
    });

    it('should throw an error if game not found', async () => {
      // Arrange
      const gameId = 'non-existent-id';
      gameRepository.findById.mockResolvedValue(undefined);

      // Act & Assert
      await expect(gameService.getGame(gameId)).rejects.toThrow('Game not found');
      expect(gameRepository.findById).toHaveBeenCalledWith(gameId);
    });
  });

  describe('getAllGames', () => {
    it('should return all games', async () => {
      // Arrange
      const games = [
        new Game({ name: 'Game 1' }),
        new Game({ name: 'Game 2' })
      ];
      gameRepository.findPaginated.mockResolvedValue({
        data: games,
        total: games.length,
        limit: 10,
        offset: 0,
        hasMore: false
      });

      const filters: PaginationDTO<GameFilterDTO> = {
        data: { name: 'Game' },
        limit: 10,
        offset: 0
      };

      // Act
      const result = await gameService.getAllGamesPaginated(filters);

      // Assert
      expect(gameRepository.findPaginated).toHaveBeenCalled();
      expect(result.data.length).toBe(2);
      expect(result.data[0].name).toBe('Game 1');
      expect(result.data[1].name).toBe('Game 2');
    });

    it('should return empty array when no games exist', async () => {
      // Arrange
      gameRepository.findPaginated.mockResolvedValue({
        data: [],
        total: 0,
        limit: 10,
        offset: 0,
        hasMore: false
      });

      const filters: PaginationDTO<GameFilterDTO> = {
        data: { name: 'Game' },
        limit: 10,
        offset: 0
      };

      // Act
      const result = await gameService.getAllGamesPaginated(filters);

      // Assert
      expect(gameRepository.findPaginated).toHaveBeenCalled();
      expect(result.data.length).toBe(0);
    });
  });

  describe('updateGame', () => {
    it('should update a game', async () => {
      // Arrange
      const gameId = mockGame.getId();
      const updateData: UpdateGameDTO = { name: 'Updated Game' };
      
      gameRepository.findById.mockResolvedValue(mockGame);
      
      const updatedGame = new Game({
        id: gameId,
        name: updateData.name || ''
      });
      
      gameRepository.update.mockResolvedValue(updatedGame);

      // Act
      const result = await gameService.updateGame(gameId, updateData);

      // Assert
      expect(gameRepository.findById).toHaveBeenCalledWith(gameId);
      expect(gameRepository.update).toHaveBeenCalled();
      expect(result.name).toBe(updateData.name);
    });

    it('should throw an error if game not found during update', async () => {
      // Arrange
      const gameId = 'non-existent-id';
      const updateData: UpdateGameDTO = { name: 'Updated Game' };
      
      gameRepository.findById.mockResolvedValue(undefined);

      // Act & Assert
      await expect(gameService.updateGame(gameId, updateData)).rejects.toThrow('Game not found');
      expect(gameRepository.findById).toHaveBeenCalledWith(gameId);
      expect(gameRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteGame', () => {
    it('should delete a game', async () => {
      // Arrange
      const gameId = mockGame.getId();
      gameRepository.findById.mockResolvedValue(mockGame);
      gameRepository.delete.mockResolvedValue(true);

      // Act
      const result = await gameService.deleteGame(gameId);

      // Assert
      expect(gameRepository.findById).toHaveBeenCalledWith(gameId);
      expect(gameRepository.delete).toHaveBeenCalledWith(gameId);
      expect(result).toBe(true);
    });

    it('should throw an error if game not found during deletion', async () => {
      // Arrange
      const gameId = 'non-existent-id';
      gameRepository.findById.mockResolvedValue(undefined);

      // Act & Assert
      await expect(gameService.deleteGame(gameId)).rejects.toThrow('Game not found');
      expect(gameRepository.findById).toHaveBeenCalledWith(gameId);
      expect(gameRepository.delete).not.toHaveBeenCalled();
    });
  });
}); 