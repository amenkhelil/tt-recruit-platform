const express = require('express');
const adminUserController = require('../controllers/adminUser.controller');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.post('/users', adminUserController.createInternalUser);
router.get('/users', adminUserController.listUsers);
router.patch('/users/:id', adminUserController.updateUser);

module.exports = router;
