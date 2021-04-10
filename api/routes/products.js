const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const multer = require('multer');
const {v4: uuidv4} = require('uuid');

// Handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}` + file.originalname);
  }
});
const imageMimeTypes = [
  'image/jpg',
  'image/jpeg',
  'image/gif',
  'image/png'
]
const fileFilter = (req, file, cb) => {
  cb(null, imageMimeTypes.includes(file.mimetype))
}
const upload = multer({storage, fileFilter})

// Handling GET Request
router.get('/', (req, res, next) => {
  Product.find()
  .select('name price _id productImage')
  .exec()
  .then(docs => {
    const response = {
      count: docs.length,
      products: docs.map(product => {
        return {
           name: product.name,
           price: product.price,
           id: product._id,
           productImage: product.productImage,
          request: {
            type:'GET',
            description:'Fetch the individual product',
            url: `/products/${product._id}`
          }
        }
      })
    }
    res.status(200).json(response);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error:err
    });
  });
});


// Fetching Indiviual Item
router.get('/:productId', (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
  .select('name price _id productImage')
  .exec()
  .then(doc => {
    console.log(doc);
    doc ? (
      res.status(200).json({
        product: doc,
        request: {
          type: 'GET',
          description:'fetch all products',
          url: `/products`
        }
      })
    ) : (
      res
      .status(404)
      .json({
        message: 'No valid entry found for the provided product!'
      })
    )
  })
  .catch(err => {
    console.log(err);
    res
    .status(500)
    .json({
      error:err,
    });
  });
});

// Handling POST Request
router.post('/', upload.single('productImage'),(req, res, next) => {
  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  })
  product.save()
  .then(result => {
    res.status(201).json({
      message:'Created Product Successfully!',
      createdProduct: {
        name: result.name,
        price: result.price,
        _id: result._id,
        productImage:result.productImage,
        request: {
          type: 'GET',
          description:'Fetch the details of item',
          url: `/products/${product._id}`
        }
      }
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err
    });
  });
});

// 

// Handling PATCH/Update Request
router.patch('/:productId', (req, res, next) => {
  const id = req.params.productId;
  const updateOps = {};
  for (const ops of req.body){
    updateOps[ops.propName] = ops.value;
  }
  Product.update({_id:id}, { $set: updateOps })
  .exec()
  .then(result => {
    console.log(result);
    res.status(200).json({
      message: 'Product Updated!',
      request: {
        type: 'GET',
        description:'fetch all products',
        url: '/products'
      }
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      errror: err
    });
  });
});


// Handling DELETE Request
router.delete('/:productId', (req, res, next) => {
  const id = req.params.productId;
  Product.remove({_id: id})
  .exec()
  .then(result => {
    res.status(200).json({
      message: 'Product deleted!',
      request: {
        type: 'POST',
        description:'To add a new product',
        url:'/products',
        body: {
          name: 'String',
          price: 'Number',
          productImage: 'images/png || images/jpeg'
        }
      }
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err
    });
  });
});

module.exports = router;
