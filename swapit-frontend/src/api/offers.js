import client from './client';

export const createOffer = (data) => client.post('/offers', data);
export const updateOffer = (id, status) => client.put(`/offers/${id}`, { status });
export const getOffersByListing = (listingId) => client.get(`/offers/listing/${listingId}`);
