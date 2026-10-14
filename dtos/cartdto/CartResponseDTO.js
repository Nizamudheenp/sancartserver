const ProductResponseDTO = require('../productdto/ProductResponseDTO');

class CartItemResponseDTO {
  constructor(item) {
    this.product = item.product && item.product.name
      ? new ProductResponseDTO(item.product)
      : null;
    this.quantity = item.quantity;
  }
}

class CartResponseDTO {
  constructor(cart) {
    this.items = Array.isArray(cart.items)
      ? cart.items.map(item => new CartItemResponseDTO(item))
      : [];
  }
}

module.exports = CartResponseDTO;
