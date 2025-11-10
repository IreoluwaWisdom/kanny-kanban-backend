import prisma from '../config/database';
import boardService from './board.service';

export class ColumnService {
  async createColumn(boardId: string, name: string, userId: string) {
    // Verify board ownership
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        userId,
      },
    });

    if (!board) {
      throw new Error('Board not found');
    }

    // Get the highest position
    const lastColumn = await prisma.column.findFirst({
      where: { boardId },
      orderBy: { position: 'desc' },
    });

    const position = lastColumn ? lastColumn.position + 1 : 0;

    return prisma.column.create({
      data: {
        name,
        boardId,
        position,
      },
      select: {
        id: true,
        name: true,
        boardId: true,
        position: true,
      },
    });
  }

  async updateColumn(columnId: string, name: string, userId: string) {
    // Verify ownership through board
    const column = await prisma.column.findFirst({
      where: { id: columnId },
      include: { board: true },
    });

    if (!column || column.board.userId !== userId) {
      throw new Error('Column not found');
    }

    return prisma.column.update({
      where: { id: columnId },
      data: { name },
      select: {
        id: true,
        name: true,
      },
    });
  }

  async deleteColumn(columnId: string, userId: string) {
    // Verify ownership through board
    const column = await prisma.column.findFirst({
      where: { id: columnId },
      include: { board: true },
    });

    if (!column || column.board.userId !== userId) {
      throw new Error('Column not found');
    }

    await prisma.column.delete({
      where: { id: columnId },
    });
  }
}

export default new ColumnService();

