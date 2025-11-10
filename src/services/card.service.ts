import prisma from '../config/database';

export class CardService {
  async createCard(columnId: string, title: string, description: string | null, userId: string) {
    // Verify column ownership through board
    const column = await prisma.column.findFirst({
      where: { id: columnId },
      include: { board: true },
    });

    if (!column || column.board.userId !== userId) {
      throw new Error('Column not found');
    }

    // Get the highest position
    const lastCard = await prisma.card.findFirst({
      where: { columnId },
      orderBy: { position: 'desc' },
    });

    const position = lastCard ? lastCard.position + 1 : 0;

    return prisma.card.create({
      data: {
        title,
        description,
        columnId,
        position,
      },
      select: {
        id: true,
        title: true,
        description: true,
        columnId: true,
        position: true,
      },
    });
  }

  async updateCard(cardId: string, title: string, description: string | null, userId: string) {
    // Verify ownership through column -> board
    const card = await prisma.card.findFirst({
      where: { id: cardId },
      include: {
        column: {
          include: { board: true },
        },
      },
    });

    if (!card || card.column.board.userId !== userId) {
      throw new Error('Card not found');
    }

    return prisma.card.update({
      where: { id: cardId },
      data: { title, description },
      select: {
        id: true,
        title: true,
        description: true,
      },
    });
  }

  async deleteCard(cardId: string, userId: string) {
    // Verify ownership through column -> board
    const card = await prisma.card.findFirst({
      where: { id: cardId },
      include: {
        column: {
          include: { board: true },
        },
      },
    });

    if (!card || card.column.board.userId !== userId) {
      throw new Error('Card not found');
    }

    await prisma.card.delete({
      where: { id: cardId },
    });
  }

  async moveCard(cardId: string, columnId: string, position: number, userId: string) {
    // Verify card ownership
    const card = await prisma.card.findFirst({
      where: { id: cardId },
      include: {
        column: {
          include: { board: true },
        },
      },
    });

    if (!card || card.column.board.userId !== userId) {
      throw new Error('Card not found');
    }

    // Verify target column ownership
    const targetColumn = await prisma.column.findFirst({
      where: { id: columnId },
      include: { board: true },
    });

    if (!targetColumn || targetColumn.board.userId !== userId) {
      throw new Error('Target column not found');
    }

    // If moving to the same column, just reorder
    if (card.columnId === columnId) {
      // Get all cards in the column
      const cards = await prisma.card.findMany({
        where: { columnId },
        orderBy: { position: 'asc' },
      });

      // Remove the card from its current position
      const filteredCards = cards.filter((c) => c.id !== cardId);
      
      // Insert at the new position
      const newCards = [
        ...filteredCards.slice(0, position),
        card,
        ...filteredCards.slice(position),
      ];

      // Update positions
      await Promise.all(
        newCards.map((c, idx) =>
          prisma.card.update({
            where: { id: c.id },
            data: { position: idx },
          })
        )
      );
    } else {
      // Moving to a different column
      // Remove from old column and reorder
      const oldColumnCards = await prisma.card.findMany({
        where: { columnId: card.columnId },
        orderBy: { position: 'asc' },
      });

      const filteredOldCards = oldColumnCards.filter((c) => c.id !== cardId);
      await Promise.all(
        filteredOldCards.map((c, idx) =>
          prisma.card.update({
            where: { id: c.id },
            data: { position: idx },
          })
        )
      );

      // Add to new column
      const newColumnCards = await prisma.card.findMany({
        where: { columnId },
        orderBy: { position: 'asc' },
      });

      const newCards = [
        ...newColumnCards.slice(0, position),
        card,
        ...newColumnCards.slice(position),
      ];

      await Promise.all(
        newCards.map((c, idx) =>
          prisma.card.update({
            where: { id: c.id },
            data: {
              columnId: columnId,
              position: idx,
            },
          })
        )
      );
    }

    return { success: true };
  }
}

export default new CardService();

