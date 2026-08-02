class VerifyPaymentRequestDTO {
  constructor(body) {
    this.razorpayOrderId = body.razorpay_order_id || "";
    this.razorpayPaymentId = body.razorpay_payment_id || "";
    this.razorpaySignature = body.razorpay_signature || "";
  }
}


module.exports = VerifyPaymentRequestDTO;
