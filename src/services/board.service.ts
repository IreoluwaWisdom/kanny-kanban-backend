import prisma from '../config/database';

export class BoardService {
  async getBoards(userId: string) {
    return prisma.board.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getBoardById(boardId: string, userId: string) {
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        userId,
      },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });

    if (!board) {
      throw new Error('Board not found');
    }

    return board;
  }

  async getOrCreateBoard(userId: string) {
    // Try to find existing board
    let board = await prisma.board.findFirst({
      where: { userId },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });

    // If no board exists, create one with default columns
    if (!board) {
      board = await prisma.board.create({
        data: {
          name: 'Kanny',
          userId,
          columns: {
            create: [
              { name: 'To Do', position: 0 },
              { name: 'In Progress', position: 1 },
              { name: 'Completed', position: 2 },
            ],
          },
        },
        include: {
          columns: {
            orderBy: { position: 'asc' },
            include: {
              cards: {
                orderBy: { position: 'asc' },
              },
            },
          },
        },
      });
    } else if (!board.columns || board.columns.length === 0) {
      // If board exists but has no columns, create default columns
      await prisma.column.createMany({
        data: [
          { name: 'To Do', position: 0, boardId: board.id },
          { name: 'In Progress', position: 1, boardId: board.id },
          { name: 'Completed', position: 2, boardId: board.id },
        ],
      });

      // Reload board with columns
      board = await prisma.board.findFirst({
        where: { id: board.id },
        include: {
          columns: {
            orderBy: { position: 'asc' },
            include: {
              cards: {
                orderBy: { position: 'asc' },
              },
            },
          },
        },
      });
    }

    return board;
  }

  async createBoard(name: string, userId: string) {
    // Create board with three default columns
    const board = await prisma.board.create({
      data: {
        name,
        userId,
        columns: {
          create: [
            { name: 'To Do', position: 0 },
            { name: 'In Progress', position: 1 },
            { name: 'Completed', position: 2 },
          ],
        },
      },
      select: {
        id: true,
        name: true,
        userId: true,
        createdAt: true,
      },
    });

    return board;
  }

  async updateBoard(boardId: string, name: string, userId: string) {
    // Verify ownership
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        userId,
      },
    });

    if (!board) {
      throw new Error('Board not found');
    }

    return prisma.board.update({
      where: { id: boardId },
      data: { name },
      select: {
        id: true,
        name: true,
      },
    });
  }

  async deleteBoard(boardId: string, userId: string) {
    // Verify ownership
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        userId,
      },
    });

    if (!board) {
      throw new Error('Board not found');
    }

    await prisma.board.delete({
      where: { id: boardId },
    });
  }
}

export default new BoardService();

