const express = require('express');
const router = express.Router();
const tutorController = require('./tutor.controller');
const auth = require('../../shared/middleware/auth');

router.get('/', tutorController.getAllTutors);
router.get('/:id', tutorController.getTutorById);
router.post('/', auth, tutorController.createTutor);
router.put('/:id', auth, tutorController.updateTutor);

module.exports = router;
