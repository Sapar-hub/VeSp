import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SceneService } from '../../src/services/SceneService';
import prisma from '../../src/db';

// Mock prisma client
vi.mock('../../src/db', () => ({
  default: {
    scene: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: { // Mock user as it's included in some scene queries
      findUnique: vi.fn(),
    },
  },
}));

describe('SceneService', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  describe('saveScene', () => {
    it('should save a new scene', async () => {
      // Arrange
      const userId = 1;
      const name = 'Test Scene';
      const data = { objects: [] };
      const isPublic = false;
      const createdScene = { id: 1, name, data, isPublic, ownerId: userId, createdAt: new Date() };

      (prisma.scene.create as vi.Mock).mockResolvedValue(createdScene);

      // Act
      const result = await SceneService.saveScene(userId, name, data, isPublic);

      // Assert
      expect(prisma.scene.create).toHaveBeenCalledWith({
        data: {
          name,
          data,
          isPublic,
          ownerId: userId,
        },
      });
      expect(result).toEqual(createdScene);
    });
  });

  describe('getPublicScenes', () => {
    it('should return a list of public scenes', async () => {
      // Arrange
      const publicScenes = [
        { id: 1, name: 'Public Scene 1', data: {}, isPublic: true, ownerId: 2, createdAt: new Date(), owner: { email: 'owner1@example.com' } },
        { id: 2, name: 'Public Scene 2', data: {}, isPublic: true, ownerId: 3, createdAt: new Date(), owner: { email: 'owner2@example.com' } },
      ];

      (prisma.scene.findMany as vi.Mock).mockResolvedValue(publicScenes);

      // Act
      const result = await SceneService.getPublicScenes();

      // Assert
      expect(prisma.scene.findMany).toHaveBeenCalledWith({
        where: { isPublic: true },
        select: {
          id: true,
          name: true,
          createdAt: true,
          owner: {
            select: { email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(publicScenes);
    });
  });

  describe('getUserScenes', () => {
    it('should return a list of scenes owned by a specific user', async () => {
      // Arrange
      const userId = 1;
      const userScenes = [
        { id: 3, name: 'User Scene 1', data: {}, isPublic: false, ownerId: userId, createdAt: new Date() },
        { id: 4, name: 'User Scene 2', data: {}, isPublic: true, ownerId: userId, createdAt: new Date() },
      ];

      (prisma.scene.findMany as vi.Mock).mockResolvedValue(userScenes);

      // Act
      const result = await SceneService.getUserScenes(userId);

      // Assert
      expect(prisma.scene.findMany).toHaveBeenCalledWith({
        where: { ownerId: userId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(userScenes);
    });
  });

  describe('getSceneById', () => {
    it('should return a scene by its ID', async () => {
      // Arrange
      const sceneId = 5;
      const scene = { id: sceneId, name: 'Specific Scene', data: {}, isPublic: false, ownerId: 1, createdAt: new Date(), owner: { id: 1, email: 'user@example.com' } };

      (prisma.scene.findUnique as vi.Mock).mockResolvedValue(scene);

      // Act
      const result = await SceneService.getSceneById(sceneId);

      // Assert
      expect(prisma.scene.findUnique).toHaveBeenCalledWith({
        where: { id: sceneId },
        include: {
          owner: {
            select: { id: true, email: true },
          },
        },
      });
      expect(result).toEqual(scene);
    });

    it('should return null if scene is not found', async () => {
      // Arrange
      const sceneId = 99;
      (prisma.scene.findUnique as vi.Mock).mockResolvedValue(null);

      // Act
      const result = await SceneService.getSceneById(sceneId);

      // Assert
      expect(prisma.scene.findUnique).toHaveBeenCalledWith({
        where: { id: sceneId },
        include: {
          owner: {
            select: { id: true, email: true },
          },
        },
      });
      expect(result).toBeNull();
    });
  });

  describe('updateScene', () => {
    it('should update a scene with new data', async () => {
      // Arrange
      const sceneId = 6;
      const newName = 'Updated Name';
      const newData = { newKey: 'newValue' };
      const updatedScene = { id: sceneId, name: newName, data: newData, isPublic: false, ownerId: 1, createdAt: new Date() };

      (prisma.scene.update as vi.Mock).mockResolvedValue(updatedScene);

      // Act
      const result = await SceneService.updateScene(sceneId, newName, newData);

      // Assert
      expect(prisma.scene.update).toHaveBeenCalledWith({
        where: { id: sceneId },
        data: {
          name: newName,
          data: newData,
        },
      });
      expect(result).toEqual(updatedScene);
    });
  });

  describe('deleteScene', () => {
    it('should delete a scene', async () => {
      // Arrange
      const sceneId = 7;
      const deletedScene = { id: sceneId, name: 'Deleted Scene', data: {}, isPublic: false, ownerId: 1, createdAt: new Date() };

      (prisma.scene.delete as vi.Mock).mockResolvedValue(deletedScene);

      // Act
      const result = await SceneService.deleteScene(sceneId);

      // Assert
      expect(prisma.scene.delete).toHaveBeenCalledWith({
        where: { id: sceneId },
      });
      expect(result).toEqual(deletedScene);
    });
  });
});
