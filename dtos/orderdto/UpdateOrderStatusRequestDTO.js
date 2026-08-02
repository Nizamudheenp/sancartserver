class UpdateOrderStatusRequestDTO {
  constructor(body) {
    this.status = body.status;
  }
}

module.exports = UpdateOrderStatusRequestDTO;
