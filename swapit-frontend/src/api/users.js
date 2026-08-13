import client from './client';

export const getUser = (id) => client.get(`/users/${id}`);
export const updateMe = (data) => client.put('/users/me', data);
export const getMyListings = () => client.get('/users/me/listings');
export const getMyFavorites = () => client.get('/users/me/favorites');
