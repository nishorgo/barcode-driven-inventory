const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { createProduct, getAllProducts, updateProductCategory } = require('../controllers/products.controller');

router.post('/',
    [
      body('name').trim().notEmpty(),
      body('barcode').trim().notEmpty(),
      body('description').trim().notEmpty(),
    ],
    createProduct
);

router.get('/', getAllProducts);

router.patch('/:id/',
    [
        body('category').trim().notEmpty()
    ],
    updateProductCategory
);


module.exports = router;