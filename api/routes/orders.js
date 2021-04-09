const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');
const mongoose = require('mongoose');

// Handling GET Request
router.get('/', (req, res, next) => {
  Order.find()
  .select('product quantity _id')
  .populate('product', 'name')
  .exec()
  .then(docs => {
    res.status(200).json({
      count: docs.length,
      orders: docs.map(order => {
        return {
          _id: order._id,
          product: order.product,
          quantity: order.quantity,
          request: {
            type: 'GET',
            url: `/orders/${order._id}`
          }
        }
      })
    });
  })
  .catch(err => {
    res.status(500).json({
      error: err
    })
  })
})

// Fetching Indiviual Item
router.get('/:orderId', (req, res, next) => {
  Order.findById(req.params.orderId)
  .populate('product')
  .exec()
  .then(order => {
    if(!order){
      return res.status(404).json({
        message: 'Order not found!'
      })
    }

    res.status(200).json({
      order: order, 
      request: {
        type: 'GET',
        description:'Fetch all order',
        url: '/orders'
      }
    })
  })
  .catch(err => {
    res.status(500).json({
      error: err
    })
  })
})


// Handling POST Request
router.post('/', (req, res, next) => {
  Product.findById(req.body.productId)
  .then(product => {
    if (!product) {
      return res.status(404).json({
        message: 'Product not Found'
      })
    }
    const order = new Order({
    _id: mongoose.Types.ObjectId(),
    quantity: req.body.quantity,
    product: req.body.productId
  });
  order
  .save()
  .then(result => {
      return res.status(201).json({
      message: 'Order Stored!',
      createdOrder: {
        product: result.product,
        quantity: result.quantity
      },
      request: {
        type: 'GET',
        url: `/orders/${result._id}`
      }
    })
  })
})
  .catch(err => {
    res.status(500).json({
      message: 'Product not found!',
      error: err
    });
  });
});

// Handling DELETE Request
router.delete('/:orderId', (req, res, next) => {
  Order.remove({
    _id: req.params.orderId
  })
  .then(result => {
    res.status(200).json({
      message: 'Order deleted!',
      request: {
        type: 'POST',
        url:'/orders',
        description:'Add a new order',
        body: {
          productId: 'ID',
          quantity: 'Number' 
        }
      }
    })
  })
})


module.exports = router;