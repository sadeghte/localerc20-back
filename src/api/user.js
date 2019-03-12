import { Router } from 'express';
import requireParam from '../middleware/requestParamRequire';
let router = Router();

router.all('/info', function (req, res, next) {
  res.json({
    success: true,
    user: req.data.user
  });
});

export default router;