import { Response } from 'express';
import columnService from '../services/column.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class ColumnController {
  async createColumn(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const boardId = req.params.boardId;
      const { name } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Column name is required' });
      }

      const column = await columnService.createColumn(boardId, name.trim(), userId);
      res.status(201).json(column);
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error ? error.message : 'Failed to create column',
      });
    }
  }

  async updateColumn(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const columnId = req.params.id;
      const { name } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Column name is required' });
      }

      const column = await columnService.updateColumn(columnId, name.trim(), userId);
      res.json(column);
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error ? error.message : 'Failed to update column',
      });
    }
  }

  async deleteColumn(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const columnId = req.params.id;
      await columnService.deleteColumn(columnId, userId);
      res.json({ message: 'Column deleted successfully' });
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error ? error.message : 'Failed to delete column',
      });
    }
  }
}

export default new ColumnController();

