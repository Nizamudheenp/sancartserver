const mongoose = require('mongoose');
const ReviewDB = require('../models/reviewModel');
const NAMES_POOL = require('./namePool');
const { COMMENTS_5_STAR, COMMENTS_4_STAR, COMMENTS_3_STAR } = require('./commentPool');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomPastDate(maxDaysAgo = 60) {
  const date = new Date();
  const daysAgo = getRandomInt(2, maxDaysAgo);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(getRandomInt(8, 21), getRandomInt(0, 59));
  return date;
}

exports.seedProductReviews = async (productId) => {
  const dummyUserId = new mongoose.Types.ObjectId();
  const reviewCount = getRandomInt(12, 25);

  const shuffledNames = [...NAMES_POOL].sort(() => 0.5 - Math.random());
  const selectedNames = shuffledNames.slice(0, reviewCount);

  const reviewsToCreate = selectedNames.map((name) => {
    const rand = Math.random();
    let rating = 5;
    let commentList = COMMENTS_5_STAR;

    if (rand > 0.70 && rand <= 0.95) {
      rating = 4;
      commentList = COMMENTS_4_STAR;
    } else if (rand > 0.95) {
      rating = 3;
      commentList = COMMENTS_3_STAR;
    }

    const comment = commentList[getRandomInt(0, commentList.length - 1)];
    const createdAt = getRandomPastDate(60);

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
