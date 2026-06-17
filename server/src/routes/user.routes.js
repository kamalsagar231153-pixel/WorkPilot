const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const ctrl = require('../controllers/user.controller');

router.use(auth);

// anyone in the org can see the team
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);

// admins only from here
router.post(
  '/',
  requireRole('admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6+ characters'),
    body('role').optional().isIn(['admin', 'member']),
  ],
  validate,
  ctrl.create
);

router.put(
  '/:id',
  requireRole('admin'),
  [body('name').optional().trim().notEmpty(), body('role').optional().isIn(['admin', 'member'])],
  validate,
  ctrl.update
);

router.delete('/:id', requireRole('admin'), ctrl.remove);

module.exports = router;
