const ReviewResponseDTO = require("../reviewdto/ReviewResponseDTO");

class ProductResponseDTO{
    constructor(product){
        this.id = product._id;
        this.name = product.name;
        this.description = product.description;
        this.price = product.price;
        this.images = product.images || [];
        this.category = product.category;
        this.brand = product.brand;
        this.tags = product.tags || [];
        this.stock = product.stock || 0;
        this.rating = product.rating || 0;
        this.numReviews = product.numReviews || 0;
        this.reviews = product.reviews 
            ? product.reviews.map(r => r.comment ? new ReviewResponseDTO(r) : r)
            : [];
        this.createdAt = product.createdAt;
    }
}

module.exports = ProductResponseDTO;