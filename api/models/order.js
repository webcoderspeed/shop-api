const mongoose = require('mongoose');

const orderScehema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  quantity:{
    type: Number,
    default: 1
  }
})

module.exports = mongoose.model('Order', orderScehema);