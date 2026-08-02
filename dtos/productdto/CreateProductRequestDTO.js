class CreateProductRequestDTO {
  constructor(body, files) {
    this.name = body.name ? body.name.trim() : null;
    this.description = body.description ? body.description.trim() : null;
    this.price = body.price ? Number(body.price) : null;
    this.category = body.category ? body.category.trim() : null;
    this.brand = body.brand ? body.brand.trim() : null;
    this.stock = body.stock ? parseInt(body.stock, 10) : 0;
    
    // Parse tags if sent as string or array
    if (Array.isArray(body.tags)) {
      this.tags = body.tags;
    } else if (typeof body.tags === 'string') {
      this.tags = body.tags.split(',').map(tag => tag.trim());
    } else {
      this.tags = [];
    }

    // Extract file paths from multer files array
    this.images = files ? files.map(file => file.path) : [];
  }
}

module.exports = CreateProductRequestDTO;
