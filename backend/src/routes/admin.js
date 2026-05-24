const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyJWT, requireRole } = require('../middleware/verifyJWT');

router.use(verifyJWT, requireRole('admin'));

router.post('/warga', adminController.registerWarga);
router.get('/warga', adminController.getWarga);

router.post('/warga/bulk-dummy', adminController.generateDummyWarga);
router.post('/warga/batch-predict', adminController.batchPredictWarga);
router.post('/warga/bulk-import', adminController.importWargaBulk);

router.put('/warga/:id', adminController.updateWarga);
router.delete('/warga/:id', adminController.deleteWarga);

module.exports = router;
