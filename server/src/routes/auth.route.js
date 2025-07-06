import express from 'express';

import {
  sign,
  logout,
  loginRoute,
  checkAuth,
} from '../controllers/auth.controller.js';
import { protectRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/signup', sign);
router.get('/logout', logout);
router.post('/login', loginRoute);
router.get('/check', protectRoute, checkAuth);

export default router;
