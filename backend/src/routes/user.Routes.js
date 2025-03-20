import {Router} from "express"
import { signup, login, updateUser, getUsers} from "../controllers/user.controller.js"
import { verifyToken } from "../middleware/auth.middlewares.js"
const router = Router()

router.post('/signup',signup)
router.post('/login',login)
router.put('/',verifyToken,updateUser)
router.get('/bulk',verifyToken,getUsers)
export default router
