class RazorpayOrderResponseDTO {
  constructor(order) {
    this.orderId = order.id;
    this.amount = order.amount;
    this.currency = order.currency;
  }
}

module.exports = RazorpayOrderResponseDTO;
