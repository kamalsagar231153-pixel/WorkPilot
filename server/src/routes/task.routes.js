const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/task.controller');

router.use(auth);

router.get('/', ctrl.list); // ?projectId optional
router.get('/:id', ctrl.getOne);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('projectId').notEmpty().withMessage('projectId is required'),
    body('status').optional().isIn(['todo', 'in-progress', 'done']),
    body('description').optional().isString(),
  ],
  validate,
  ctrl.create
);

router.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty(),
    body('status').optional().isIn(['todo', 'in-progress', 'done']),
    body('description').optional().isString(),
  ],
  validate,
  ctrl.update
);

router.delete('/:id', ctrl.remove);

module.exports = router;
