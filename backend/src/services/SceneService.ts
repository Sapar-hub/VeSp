import prisma from '../db.js';
import { Prisma } from '@prisma/client';

export class SceneService {
  static async saveScene(userId: number, name: string, data: Prisma.InputJsonValue, isPublic: boolean) {
    return prisma.scene.create({
      data: {
        name,
        data,
        isPublic,
        ownerId: userId,
      },
    });
  }

  static async getPublicScenes() {
    return prisma.scene.findMany({
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
  }

  static async getUserScenes(userId: number) {
    return prisma.scene.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getSceneById(sceneId: number) {
    return prisma.scene.findUnique({
      where: { id: sceneId },
      include: {
        owner: {
          select: { id: true, email: true },
        },
      },
    });
  }

  static async updateScene(sceneId: number, name: string, data: Prisma.InputJsonValue) {
    return prisma.scene.update({
        where: { id: sceneId },
        data: {
            name,
            data
        }
    })
  }

  static async deleteScene(sceneId: number) {
    return prisma.scene.delete({
      where: { id: sceneId },
    });
  }
}
