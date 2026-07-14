const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/tutorController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', tutorController.getAllTutors);
router.get('/my-profile', auth, tutorController.getMyProfile);
router.put('/my-profile', auth, tutorController.updateMyProfile);
router.get('/my-certificates', auth, tutorController.getMyCertificates);
router.post('/my-certificates', auth, upload.single('certificate'), tutorController.uploadCertificate);
router.delete('/my-certificates/:id', auth, tutorController.deleteCertificate);

router.get('/:id', tutorController.getTutorById);
router.post('/', auth, tutorController.createTutor);
router.put('/:id', auth, tutorController.updateTutor);

module.exports = router;
