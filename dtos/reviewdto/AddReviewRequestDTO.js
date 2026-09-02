class AddReviewRequestDTO {
  constructor(body) {
    this.rating = body.rating !== undefined ? Number(body.rating) : null;
    this.comment = body.comment ? body.comment.trim() : "";
  }
}

module.exports = AddReviewRequestDTO;
