(function (global) {
  'use strict';

  const { HttpClient } = global;
  const { ENDPOINTS } = global.ConnectionMfConstants;

  const searchUsers   = (q)   => HttpClient.get(ENDPOINTS.USERS(q));
  const listMine      = ()    => HttpClient.get(ENDPOINTS.CONNECTIONS);
  const listPending   = ()    => HttpClient.get(ENDPOINTS.PENDING);
  const sendRequest   = (id)  => HttpClient.post(ENDPOINTS.REQUEST, { receiverId: id });
  const accept        = (id)  => HttpClient.patch(ENDPOINTS.ACCEPT(id));
  const reject        = (id)  => HttpClient.patch(ENDPOINTS.REJECT(id));
  const remove        = (id)  => HttpClient.delete(ENDPOINTS.REMOVE(id));

  global.ConnectionMfApi = Object.freeze({ searchUsers, listMine, listPending, sendRequest, accept, reject, remove });
})(window);
