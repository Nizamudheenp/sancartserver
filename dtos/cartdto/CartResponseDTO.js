const ProductResponseDTO = require('../productdto/ProductResponseDTO');

class CartItemResponseDTO {
  constructor(item) {
    this.id = item._id;
    // Map populated product with ProductResponseDTO, or keep ID string if not populated
    this.product = item.product && item.product.name 
      ? new ProductResponseDTO(item.product) 
      : item.product;
    this.quantity = item.quantity;
  }
}

class CartResponseDTO {
  constructor(cart) {
    this.id = cart._id;
    this.user = cart.user;
    this.items = cart.items ? cart.items.map(item => new CartItemResponseDTO(item)) : [];
  }
}

module.exports = CartResponseDTO;

