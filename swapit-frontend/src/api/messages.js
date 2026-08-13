import client from './client';

export const getInbox = () => client.get('/messages/inbox');
export const getMessages = (listingId) => client.get(`/messages/${listingId}`);
export const sendMessage = (data) => client.post('/messages', data);
