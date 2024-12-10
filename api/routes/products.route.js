const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { createProduct, getAllProducts, updateProductCategory } = require('../controllers/products.controller');

router.post('/',
    auth,
    [
      body('name').trim().notEmpty(),
      body('category').trim().notEmpty(),
      body('price').isFloat({ min: 0 }),
      body('stock').isInt({ min: 0 })
    ],
    createProduct
);

router.get('/', getAllProducts);

router.patch('/:id/',
    auth,
    [
        body('category').trim().notEmpty()
    ],
    updateProductCategory
);


module.exports = router;