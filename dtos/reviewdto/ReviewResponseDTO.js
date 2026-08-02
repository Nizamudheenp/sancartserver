class ReviewResponseDTO {
  constructor(review) {
    this.id = review._id;
    this.user = review.user;
    this.name = review.name;
    this.rating = review.rating;
    this.comment = review.comment;
    this.createdAt = review.createdAt;
  }
}

module.exports = ReviewResponseDTO;
