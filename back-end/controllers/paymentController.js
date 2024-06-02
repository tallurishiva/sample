const Razorpay = require('razorpay');
const shortid = require('shortid');
const crypto = require('crypto');
require('dotenv').config();
const Transaction = require('../models/Transaction');
const Balance = require('../models/Balance');

const razorpay = new Razorpay({
  key_id:"rzp_test_ykyrrvl7rQCa2n",
  key_secret: "QKjVdVhdeTdq0BRxeBNDzaaZ",
});

exports.createOrder = async (req, res) => {
  const { amount, currency } = req.body;
  const userId = req.body.userID; // Assume userId is available from authenticated request
  const options = {
    amount: amount * 100, // Amount in paise
    currency,
    receipt: shortid.generate(),
  };

  try {
    const response = await razorpay.orders.create(options);
    res.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const userId = req.body.userID; 

  const hash = crypto.createHmac('sha256', "QKjVdVhdeTdq0BRxeBNDzaaZ")
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (hash === razorpay_signature) {
    try {
      const balance = await Balance.findOne({ userId });
      const initialBalance = balance ? balance.amount : 0;
      const newBalance = initialBalance + parseInt(req.body.amount);

      const transaction = new Transaction({
        userId,
        date: new Date(),
        particulars: 'Deposit',
        amount: parseInt(req.body.amount),
        balanceInitial:  initialBalance,
        balanceAfter: newBalance,
      });

      await transaction.save();

      if (balance) {
        balance.amount = newBalance;
        await balance.save();
      } else {
        const newBalanceDoc = new Balance({ userId, amount: newBalance });
        await newBalanceDoc.save();
      }

      res.json({ status: 'success',transaction });
    } catch (error) {
      console.log("error  "+error);
      res.status(500).json({ status: 'failed', error: error.message });
    }
  } else {
    res.status(400).json({ status: 'failed' });
  }
};

exports.withdrawFunds = async (req, res) => {
  const { amount } = req.body;
  const userId = req.body.userID;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ status: 'failed', message: 'Invalid amount' });
  }

  try {
    const balance = await Balance.findOne({ userId });
    const initialBalance = balance ? balance.amount : 0;

    if (amount > initialBalance) {
      return res.status(400).json({ status: 'failed', message: 'Insufficient balance' });
    }

    const newBalance = initialBalance - amount;

    const transaction = new Transaction({
      userId,
      date: new Date(),
      particulars: 'Withdrawal',
      amount: -amount,
      balanceInitial: initialBalance,
      balanceAfter: newBalance,
    });

    await transaction.save();

    balance.amount = newBalance;
    await balance.save();

    res.json({ status: 'success', newBalance,transaction });
  } catch (error) {
    res.status(500).json({ status: 'failed', error: error.message });
  }
};

exports.findbalance = async (req, res) => {
  const userId = req.body.userID;
  
  if (!userId ) {
    return res.status(400).json({ status: 'failed', message: 'Invalid user' });
  }

  try {
    const balance = await Balance.findOne({ userId });
    const initialBalance = balance ? balance.amount : 0;
    res.json({ status: 'success', initialBalance});
  } catch (error) {
    res.status(500).json({ status: 'failed', error: error.message });
  }
};

exports.transaction = async (req, res) => {
  const userId = req.body.userID;
  
  if (!userId ) {
    return res.status(400).json({ status: 'failed', message: 'Invalid user' });
  }

  try {
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });
    res.json({ status: 'success', transactions});
  } catch (error) {
    res.status(500).json({ status: 'failed', error: error.message });
  }
};

