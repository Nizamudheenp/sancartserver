const mongoose = require('mongoose');
const ReviewDB = require('../models/reviewModel');
const NAMES_POOL = require('./namePool');
const {
  COMMENTS_5_STAR,
  COMMENTS_4_STAR,
  COMMENTS_3_STAR
} = require('./commentPool');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomPastDate(maxDaysAgo = 90) {
  const date = new Date();
  const daysAgo = getRandomInt(1, maxDaysAgo);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(getRandomInt(8, 22), getRandomInt(0, 59));
  return date;
}

// Function to pick a star rating strictly among 3★, 4★, 5★ based on target rating bracket
function getWeightedRating(targetRating) {
  const rand = Math.random();

  if (targetRating >= 4.5) {
    // 4.5 to 4.9: >= 50% (70%) 5-star reviews, remainder from 4★ and 3★
    if (rand < 0.70) return 5;
    if (rand < 0.95) return 4;
    return 3;
  } else if (targetRating >= 3.9) {
    // 3.9 to 4.4: >= 50% (55%) 4-star reviews, remainder from 5★ and 3★
    if (rand < 0.55) return 4;
    if (rand < 0.85) return 5;
    return 3;
  } else {
    // 3.3 to 3.8: >= 50% (58%) 3-star reviews, remainder from 4★ and 5★
    if (rand < 0.58) return 3;
    if (rand < 0.88) return 4;
    return 5;
  }
}

function getCommentForRating(rating) {
  let pool;
  switch (rating) {
    case 5:
      pool = COMMENTS_5_STAR;
      break;
    case 4:
      pool = COMMENTS_4_STAR;
      break;
    case 3:
    default:
      pool = COMMENTS_3_STAR;
      break;
  }
  return pool[getRandomInt(0, pool.length - 1)];
}

exports.seedProductReviews = async (productId, options = {}) => {
  const dummyUserId = new mongoose.Types.ObjectId();
  const reviewCount = options.reviewCount || getRandomInt(12, 30);

  // Target product average rating realistically selected between 3.3 and 4.9
  const targetRating = options.targetRating || parseFloat((Math.random() * (4.9 - 3.3) + 3.3).toFixed(1));

  // Completely random shuffle of South Indian names pool
  const shuffledNames = [...NAMES_POOL].sort(() => 0.5 - Math.random());
  const selectedNames = [];
  for (let i = 0; i < reviewCount; i++) {
    selectedNames.push(shuffledNames[i % shuffledNames.length]);
  }

  const reviewsToCreate = selectedNames.map((name) => {
    const rating = getWeightedRating(targetRating);
    const comment = getCommentForRating(rating);
    const createdAt = getRandomPastDate(90);

    return {
      user: dummyUserId,
      name,
      rating,
      comment,
      product: productId,
      createdAt,
      updatedAt: createdAt
    };
  });

  // Sort reviews chronologically newest first
  reviewsToCreate.sort((a, b) => b.createdAt - a.createdAt);

  const createdReviews = await ReviewDB.insertMany(reviewsToCreate);

  const totalRating = reviewsToCreate.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = totalRating / reviewCount;

  return {
    reviewIds: createdReviews.map((r) => r._id),
    numReviews: reviewCount,
    rating: parseFloat(avgRating.toFixed(1))
  };
};
