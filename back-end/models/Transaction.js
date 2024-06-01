const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: {
    type: Date,
    default: Date.now,
  },
  particulars: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  balanceInitial: {
    type: Number,
    required: true,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
