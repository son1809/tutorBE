const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const favoriteTutorController = require('../controllers/favoriteTutorController');

// Tất cả route đều yêu cầu đăng nhập
router.use(auth);

router.get('/', favoriteTutorController.getMy);
router.post('/toggle', favoriteTutorController.toggle);
router.get('/check/:tutor_id', favoriteTutorController.checkOne);

module.exports = router;
