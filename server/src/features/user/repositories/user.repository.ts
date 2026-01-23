import { PrismaClient } from '@prisma/client';

export class UserRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async findByClerkId(clerkId: string) {
    return this.prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        clerkId: true,
        firstName: true,
        lastName: true,
        email: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        clerkId: true,
        firstName: true,
        lastName: true,
        email: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async createFromClerkData(data: {
    clerkId: string;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  }) {
    return this.prisma.user.create({
      data: {
        clerkId: data.clerkId,
        email: data.email || null,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
      },
      select: {
        id: true,
        clerkId: true,
        firstName: true,
        lastName: true,
        email: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateUser(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      active?: boolean;
    },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        clerkId: true,
        firstName: true,
        lastName: true,
        email: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
