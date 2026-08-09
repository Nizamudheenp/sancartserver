const express = require('express');
const { verifyToken, verifyAdmin, verifyOptionalToken } = require('../middleware/AuthMiddleware.js');
const { createOrder, getUserOrders, getAllOrders, updateOrderStatus, cancelOrder } = require('../controllers/OrderController');

const { createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/PaymentController.js');
const { contactEmail } = require('../controllers/MessageController.js');
const validate = require('../middleware/validate');
const { createOrderSchema, updateOrderStatusSchema } = require('../validators/orderValidator');
const { createRazorpayOrderSchema } = require('../validators/paymentValidator');
const { contactMessageSchema } = require('../validators/messageValidator');
const router = express.Router();

router.post('/createorder', verifyOptionalToken, validate(createOrderSchema), createOrder);
router.get('/getuserorders', verifyToken, getUserOrders);
router.get('/getAllOrders', verifyToken, verifyAdmin, getAllOrders);
router.post('/create-razorpay-order', validate(createRazorpayOrderSchema), createRazorpayOrder);
router.post('/verify-payment', verifyRazorpayPayment);
router.put('/updateorderstatus/:id', verifyToken, verifyAdmin, validate(updateOrderStatusSchema), updateOrderStatus);
router.put('/cancelorder/:id', verifyToken, cancelOrder);


router.post('/contact', verifyToken, validate(contactMessageSchema), contactEmail);

module.exports = router;
