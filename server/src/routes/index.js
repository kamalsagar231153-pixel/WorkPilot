const router = require('express').Router();

router.get('/health', (req, res) => res.json({ success: true }));

router.use('/auth', require('./auth.routes'));
router.use('/organizations', require('./organization.routes'));
router.use('/users', require('./user.routes'));
router.use('/projects', require('./project.routes'));
router.use('/tasks', require('./task.routes'));

module.exports = router;
