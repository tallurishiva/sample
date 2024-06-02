const express = require('express');
const { createOrder, verifyPayment ,withdrawFunds, findbalance, transaction} = require('../controllers/paymentController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.post('/orders',authenticate, createOrder);
router.post('/verify',authenticate, verifyPayment);
router.post('/withdraw',authenticate, withdrawFunds);
router.post('/balance',authenticate, findbalance);
router.post('/transactions',authenticate, transaction);

module.exports = router;
