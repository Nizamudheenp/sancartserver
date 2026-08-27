class CreateOrderRequestDTO {
  constructor(body) {
    this.products = body.products || [];
    this.totalAmount = body.totalAmount ? Number(body.totalAmount) : null;
    this.shippingAddress = body.shippingAddress ? body.shippingAddress.trim() : null;
    this.paymentId = body.paymentId;
    this.paymentMethod = body.paymentMethod || "Online";
    this.status = body.status;
    this.guestEmail = body.guestEmail ? body.guestEmail.trim() : null;
  }
}

module.exports = CreateOrderRequestDTO;
