class ContactMessageRequestDTO {
  constructor(body) {
    this.name = body.name ? body.name.trim() : null;
    this.email = body.email ? body.email.toLowerCase().trim() : null;
    this.message = body.message ? body.message.trim() : null;
  }
}

module.exports = ContactMessageRequestDTO;
