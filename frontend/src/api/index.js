const BASE = '/api';

function getToken() {
  return localStorage.getItem('agro_token');
}

async function req(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  signup: (body) => req('POST', '/auth/signup', body),
  login: (body) => req('POST', '/auth/login', body),

  // Listings
  getListings: () => req('GET', '/listings'),
  getPrices: () => req('GET', '/listings/prices'),
  getMyListings: () => req('GET', '/listings/mine'),
  getListing: (id) => req('GET', `/listings/${id}`),
  createListing: (body) => req('POST', '/listings', body),
  deleteListing: (id) => req('DELETE', `/listings/${id}`),
  acceptBid: (listingId, bidId) => req('POST', `/listings/${listingId}/accept/${bidId}`),

  // Bids
  placeBid: (body) => req('POST', '/bids', body),
  getMyBids: () => req('GET', '/bids/mine'),

  // Questions
  askQuestion: (body) => req('POST', '/questions', body),
  answerQuestion: (id, answer) => req('POST', `/questions/${id}/answer`, { answer }),
};
