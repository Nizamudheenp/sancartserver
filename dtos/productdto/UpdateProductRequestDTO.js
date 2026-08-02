class UpdateProductRequestDTO {
  constructor(body, files) {
    if (body.name !== undefined) this.name = body.name.trim();
    if (body.description !== undefined) this.description = body.description.trim();
    if (body.price !== undefined) this.price = Number(body.price);
    if (body.category !== undefined) this.category = body.category.trim();
    if (body.brand !== undefined) this.brand = body.brand.trim();
    if (body.stock !== undefined) this.stock = parseInt(body.stock, 10);
    
    if (body.tags !== undefined) {
      if (Array.isArray(body.tags)) {
        this.tags = body.tags;
      } else if (typeof body.tags === 'string') {
        this.tags = body.tags.split(',').map(t => t.trim());
      }
    }

    if (files && files.length > 0) {
      this.images = files.map(file => file.path);
    }
  }
}

module.exports = UpdateProductRequestDTO;
