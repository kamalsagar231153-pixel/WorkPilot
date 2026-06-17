const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/project.controller');

router.use(auth); // login required for everything below

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);

router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Project name is required'), body('description').optional().isString()],
  validate,
  ctrl.create
);

router.put(
  '/:id',
  [body('name').optional().trim().notEmpty(), body('description').optional().isString()],
  validate,
  ctrl.update
);

router.delete('/:id', ctrl.remove);

module.exports = router;
