import { Router } from 'express';
import boardController from '../controllers/board.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All board routes require authentication
router.use(authenticate);

router.get('/', boardController.getBoards.bind(boardController));
router.get('/current', boardController.getOrCreateBoard.bind(boardController));
router.get('/:id', boardController.getBoard.bind(boardController));
router.post('/', boardController.createBoard.bind(boardController));
router.put('/:id', boardController.updateBoard.bind(boardController));
router.delete('/:id', boardController.deleteBoard.bind(boardController));

export default router;

