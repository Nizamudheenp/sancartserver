const CreateProductRequestDTO = require("../dtos/productdto/CreateProductRequestDTO");
const ProductResponseDTO = require("../dtos/productdto/ProductResponseDTO");
const UpdateProductRequestDTO = require("../dtos/productdto/UpdateProductRequestDTO");
const AddReviewRequestDTO = require("../dtos/reviewdto/AddReviewRequestDTO");
const ProductDB = require("../models/ProductModel");
const ReviewDB = require('../models/reviewModel');
const mongoose = require('mongoose')

exports.getProducts = async (req, res) => {
  try {
    const { category, tag, search, limit, page, sort } = req.query;

    let filter = {};
    if (category && category !== 'all') filter.category = category;
    if (tag) filter.tags = tag;
    if (search) filter.name = { $regex: search, $options: 'i' };

    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'rating_desc') sortOption = { rating: -1 };

    let query = ProductDB.find(filter).sort(sortOption);

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const skipNum = (pageNum - 1) * limitNum;

    query = query.skip(skipNum).limit(limitNum);

    const products = await query.exec();
    const totalCount = await ProductDB.countDocuments(filter);

    res.json({
      products: products.map(product => new ProductResponseDTO(product)),
      totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum)
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.addReview = async (req, res) => {
  const reviewReq = new AddReviewRequestDTO(req.body);
  const { productId } = req.params;
  const userId = req.user.id;
  const userName = req.user.name;

  if (!userName) {
    return res.status(400).json({ message: 'User name is required.' });
  }

  if (reviewReq.rating === undefined || reviewReq.rating === null) {
    return res.status(400).json({ message: 'Rating is required.' });
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'Invalid product ID.' });
  }

  try {
    const product = await ProductDB.findById(productId).populate({
      path: 'reviews',
      options: { sort: { createdAt: -1 } },
    });
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    const review = await ReviewDB.create({
      user: userId,
      name: userName,
      rating: reviewReq.rating,
      comment: reviewReq.comment,
      product: productId,
    });

    product.reviews.push(review._id);

    const allReviews = await ReviewDB.find({ product: productId });

    product.numReviews = allReviews.length;
    product.rating =
      allReviews.reduce((acc, rev) => acc + rev.rating, 0) / allReviews.length;

    await product.save();

    res.status(201).json({ message: 'Review added successfully.' });
  } catch (err) {
    console.error('Error in addReview:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};



exports.createProduct = async (req, res) => {
  try {
    const createDto = new CreateProductRequestDTO(req.body, req.files);

    if (!createDto.name || !createDto.description || !createDto.price || !createDto.category || !createDto.brand || !createDto.images || createDto.images.length === 0) {
      return res.status(400).json({ message: "All fields including images are required" });
    }

    const newProduct = new ProductDB({
      name: createDto.name,
      description: createDto.description,
      price: createDto.price,
      category: createDto.category,
      tags: createDto.tags,
      brand: createDto.brand,
      stock: createDto.stock,
      images: createDto.images
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(new ProductResponseDTO(savedProduct));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await ProductDB.findOne({ _id: req.params.id }).populate('reviews');
    if (!product) {
     return res.status(404).json({ message: "product not found" })
    }
    return res.status(200).json(new ProductResponseDTO(product));
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

exports.getFeaturedProducts = async (req, res) => {
  try {
    const featured = await ProductDB.find({ tags: "featured" }).limit(10);
    res.json(featured.map(product => new ProductResponseDTO(product)));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const updateDto = new UpdateProductRequestDTO(req.body, req.files);

    const product = await ProductDB.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.name = updateDto.name || product.name;
    product.description = updateDto.description || product.description;
    product.price = updateDto.price || product.price;
    product.brand = updateDto.brand || product.brand;
    product.category = updateDto.category || product.category;
    product.tags = updateDto.tags || product.tags;
    product.stock = updateDto.stock ?? product.stock;
    if (updateDto.images !== undefined) {
      product.images = updateDto.images;
      product.markModified('images');
    }

    const updated = await product.save();
    res.status(200).json(new ProductResponseDTO(updated));
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};


exports.deleteProduct = async (req, res) => {
  try {
    const product = await ProductDB.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" })

    await product.deleteOne()
    res.json({ message: "Product deleted" })

  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
}


