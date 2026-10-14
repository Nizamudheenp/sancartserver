const ReviewResponseDTO = require("../reviewdto/ReviewResponseDTO");

class ProductResponseDTO {
    constructor(product) {
        this.id = product._id;
        this.name = product.name;
        this.description = product.description;
        this.price = product.price;
        this.mrp = product.mrp || 0;
        this.weight = product.weight || '';
        this.size = product.size || '';
        this.isReadyToShip = product.isReadyToShip !== undefined ? product.isReadyToShip : true;
        this.images = product.images || [];
        this.category = product.category;
        this.tags = product.tags || [];
        this.stock = product.stock || 0;
        this.rating = product.rating || 0;
        this.numReviews = product.numReviews || 0;
        // Only map populated reviews, skip raw ObjectId refs
        this.reviews = Array.isArray(product.reviews)
            ? product.reviews
                .filter(r => r && r.comment !== undefined)
                .map(r => new ReviewResponseDTO(r))
            : [];
        this.createdAt = product.createdAt;
    }
}

module.exports = ProductResponseDTO;