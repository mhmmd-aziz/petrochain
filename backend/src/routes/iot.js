const express = require('express');
const router = express.Router();
const iotController = require('../controllers/iotController');

router.post('/scan', iotController.scanKTP);
router.post('/transaksi/complete', iotController.completeTransaksi);

module.exports = router;
