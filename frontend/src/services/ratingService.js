import api from './api';

const ratingService = {
  // Create a new rating
  createRating: (ratingData) => api.post('/ratings', ratingData),

  // Get all ratings for a freelancer
  getFreelancerRatings: (freelancerId) => api.get(`/ratings/freelancer/${freelancerId}`),

  // Get average rating for a freelancer
  getAverageRating: (freelancerId) => api.get(`/ratings/freelancer/${freelancerId}/average`),
};

export default ratingService;
