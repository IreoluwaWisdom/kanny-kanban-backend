import { Router } from 'express';
import columnController from '../controllers/column.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All column routes require authentication
router.use(authenticate);

router.post('/:boardId/columns', columnController.createColumn.bind(columnController));
router.put('/columns/:id', columnController.updateColumn.bind(columnController));
router.delete('/columns/:id', columnController.deleteColumn.bind(columnController));

export default router;

