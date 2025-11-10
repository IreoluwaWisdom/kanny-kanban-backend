import { Router } from 'express';
import cardController from '../controllers/card.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All card routes require authentication
router.use(authenticate);

router.put('/:id', cardController.updateCard.bind(cardController));
router.delete('/:id', cardController.deleteCard.bind(cardController));
router.put('/:id/move', cardController.moveCard.bind(cardController));

export default router;

