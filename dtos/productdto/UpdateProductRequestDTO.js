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

    let existingImages = [];
    const rawExisting = body.existingImages ?? body['existingImages[]'] ?? body.images ?? body['images[]'];
    
    if (rawExisting !== undefined && rawExisting !== null) {
      if (typeof rawExisting === 'string') {
        try {
          const parsed = JSON.parse(rawExisting);
          if (Array.isArray(parsed)) {
            existingImages = parsed.map(img => typeof img === 'string' ? img.trim() : img).filter(Boolean);
          } else if (parsed) {
            existingImages = [String(parsed).trim()].filter(Boolean);
          }
        } catch {
          existingImages = rawExisting.split(',').map(img => img.trim()).filter(Boolean);
        }
      } else if (Array.isArray(rawExisting)) {
        existingImages = rawExisting.map(img => typeof img === 'string' ? img.trim() : img).filter(Boolean);
      }
    }

    const uploadedImages = (files && files.length > 0) ? files.map(file => file.path).filter(Boolean) : [];

    if (rawExisting !== undefined || uploadedImages.length > 0) {
      // Deduplicate images while maintaining exact order
      this.images = Array.from(new Set([...existingImages, ...uploadedImages]));
    }
  }
}

module.exports = UpdateProductRequestDTO;
