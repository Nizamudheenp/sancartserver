class CreateOrderRequestDTO {
  constructor(body) {
    this.products = body.products || [];
    this.totalAmount = body.totalAmount ? Number(body.totalAmount) : null;

    const addr = body.shippingAddress || {};
    this.shippingAddress = {
      fullName: addr.fullName ? String(addr.fullName).trim() : '',
      phone: addr.phone ? String(addr.phone).trim() : '',
      street: addr.street ? String(addr.street).trim() : '',
      landmark: addr.landmark ? String(addr.landmark).trim() : '',
      city: addr.city ? String(addr.city).trim() : '',
      state: addr.state ? String(addr.state).trim() : '',
      pincode: addr.pincode ? String(addr.pincode).trim() : '',
    };
    this.customerPhone = this.shippingAddress.phone;

    this.paymentId = body.paymentId;
    this.paymentMethod = body.paymentMethod || "Online";
    this.status = body.status;
    this.guestEmail = body.guestEmail ? String(body.guestEmail).trim() : null;
  }
}

module.exports = CreateOrderRequestDTO;
