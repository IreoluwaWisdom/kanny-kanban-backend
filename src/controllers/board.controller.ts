import { Response } from 'express';
import boardService from '../services/board.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class BoardController {
  async getBoards(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const boards = await boardService.getBoards(userId);
      res.json(boards);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to fetch boards',
      });
    }
  }

  async getBoard(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const boardId = req.params.id;
      const board = await boardService.getBoardById(boardId, userId);
      res.json(board);
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error ? error.message : 'Board not found',
      });
    }
  }

  async getOrCreateBoard(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const board = await boardService.getOrCreateBoard(userId);
      res.json(board);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to get or create board',
      });
    }
  }

  async createBoard(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { name } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Board name is required' });
      }

      const board = await boardService.createBoard(name.trim(), userId);
      res.status(201).json(board);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Failed to create board',
      });
    }
  }

  async updateBoard(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const boardId = req.params.id;
      const { name } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Board name is required' });
      }

      const board = await boardService.updateBoard(boardId, name.trim(), userId);
      res.json(board);
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error ? error.message : 'Failed to update board',
      });
    }
  }

  async deleteBoard(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const boardId = req.params.id;
      await boardService.deleteBoard(boardId, userId);
      res.json({ message: 'Board deleted successfully' });
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error ? error.message : 'Failed to delete board',
      });
    }
  }
}

export default new BoardController();

