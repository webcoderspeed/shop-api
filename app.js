const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');


// Connecting with Database
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected!'))
.catch(err =>  console.log(err));
// Handling DeprecationWarning: Mongoose
mongoose.Promise = global.Promise;



// Handling CORS 
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if(req.method === 'OPTIONS'){
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

// fetching Routes 
const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');

// Setting Morgan and BodyParser
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())


// Setting Routes
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

// Handling Errors
app.use((req, res, next) => {
  const error = new Error('Not Found!');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    }
  });
});

module.exports = app