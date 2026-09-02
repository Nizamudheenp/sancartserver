const express = require('express');
const { createReturnRequest, getReturnRequests, updateReturnRequestStatus } = require('../controllers/ReturnController');
const { verifyToken, verifyAdmin, verifyOptionalToken } = require('../middleware/AuthMiddleware.js');
const upload = require('../middleware/uploadMiddleware.js');
const validate = require('../middleware/validate');
const { createReturnSchema } = require('../validators/returnValidator');

const router = express.Router();

router.post('/request', verifyOptionalToken, upload.array('images', 5), validate(createReturnSchema), createReturnRequest);
router.get('/list', verifyToken, verifyAdmin, getReturnRequests);
router.put('/status/:id', verifyToken, verifyAdmin, updateReturnRequestStatus);

module.exports = router;
