class RazorpayOrderRequestDTO {
  constructor(body) {
    this.amount = body.amount ? Number(body.amount) : 0;
    this.products = Array.isArray(body.products) ? body.products : [];
  }
}

module.exports = RazorpayOrderRequestDTO;
