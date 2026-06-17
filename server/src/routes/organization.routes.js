const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const ctrl = require('../controllers/organization.controller');

router.use(auth);

router.get('/me', ctrl.getMyOrg);
router.put(
  '/me',
  requireRole('admin'),
  [body('name').trim().notEmpty().withMessage('Organization name is required')],
  validate,
  ctrl.updateMyOrg
);

module.exports = router;
