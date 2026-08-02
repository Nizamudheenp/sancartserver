class CartItemRequestDTO {
  constructor(body) {
    this.productId = body.productId;
    this.quantity = body.quantity ? parseInt(body.quantity, 10) : 1;
  }
}

module.exports = CartItemRequestDTO;
