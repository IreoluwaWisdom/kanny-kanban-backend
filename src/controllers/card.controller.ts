import { Response } from 'express';
import cardService from '../services/card.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class CardController {
  async createCard(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const columnId = req.params.columnId;
      const { title, description } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ message: 'Card title is required' });
      }

      const card = await cardService.createCard(
        columnId,
        title.trim(),
        description?.trim() || null,
        userId
      );
      res.status(201).json(card);
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error ? error.message : 'Failed to create card',
      });
    }
  }

  async updateCard(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const cardId = req.params.id;
      const { title, description } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ message: 'Card title is required' });
      }

      const card = await cardService.updateCard(
        cardId,
        title.trim(),
        description?.trim() || null,
        userId
      );
      res.json(card);
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error ? error.message : 'Failed to update card',
      });
    }
  }

  async deleteCard(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const cardId = req.params.id;
      await cardService.deleteCard(cardId, userId);
      res.json({ message: 'Card deleted successfully' });
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error ? error.message : 'Failed to delete card',
      });
    }
  }

  async moveCard(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const cardId = req.params.id;
      const { columnId, position } = req.body;

      if (columnId === undefined || position === undefined) {
        return res.status(400).json({ message: 'columnId and position are required' });
      }

      await cardService.moveCard(cardId, columnId, position, userId);
      res.json({ message: 'Card moved successfully' });
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error ? error.message : 'Failed to move card',
      });
    }
  }
}

export default new CardController();

