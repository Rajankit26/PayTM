import { Router } from "express";
import { verifyToken } from "../middleware/auth.middlewares";
import { checkBalance, transferMoney } from "../controllers/transaction.controller";
const router = Router();

router.get('/balance', verifyToken, checkBalance);
router.post('/transfer',verifyToken, transferMoney);

export default router;