const express = require('express');
const { getProducts, createProduct, getProductById, updateProduct, deleteProduct, getFeaturedProducts, addReview } = require('../controllers/ProductController');
const { verifyAdmin } = require('../middleware/AuthMiddleware.js');
const { verifyToken } = require('../middleware/AuthMiddleware.js');
const upload = require('../middleware/uploadMiddleware.js');
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart, syncCart } = require('../controllers/CartController.js');
const validate = require('../middleware/validate');
const { createProductSchema, updateProductSchema, addReviewSchema } = require('../validators/productValidator');
const { cartItemSchema } = require('../validators/cartValidator');
const router = express.Router();

router.get('/getproducts', getProducts);
router.post('/addreview/:productId', verifyToken, validate(addReviewSchema), addReview);
router.post('/createproduct', verifyToken, verifyAdmin, upload.array('images', 5), validate(createProductSchema), createProduct); 
router.get('/getaproduct/:id', getProductById);
router.get('/getfeaturedproducts', getFeaturedProducts)
router.put("/updateProduct/:id", verifyToken, verifyAdmin, upload.array('images', 5), validate(updateProductSchema), updateProduct);
router.delete("/deleteProduct/:id", verifyToken, verifyAdmin, deleteProduct);

router.get("/getCart", verifyToken, getCart);
router.post("/addToCart", verifyToken, validate(cartItemSchema), addToCart);
router.put("/updateCartItem", verifyToken, validate(cartItemSchema), updateCartItem);
router.delete("/removeFromCart/:productId", verifyToken, removeFromCart);
router.delete("/clearCart", verifyToken, clearCart);
router.post("/syncCart", verifyToken, syncCart);

module.exports = router;
