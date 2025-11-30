// src/services/userService.js
import api from "../config/axiosConfig";

/**
 * Fetches graph data for users.
 * @param {Object} [params] - Optional query parameters (e.g., date range, filters).
 * @returns {Promise<Object>} The user graph data from the server.
 * @throws Will throw an error if the request fails.
 */
export async function getUsersGraph(params = {}) {
  try {
    const response = await api.get("/users/graph", { params });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.error("getUsersGraph error:", message);
    throw new Error(message);
  }
}

/**
 * Search users by name or email.
 * @param {string} query - The search term.
 * @returns {Promise<Object[]>} Matching users.
 * @throws Will throw an error if the request fails.
 */
export async function searchUser(query) {
  try {
    const response = await api.get("/users/search", { params: { query } });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.error("searchUser error:", message);
    throw new Error(message);
  }
}

/**
 * Fetch connections for a specific user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<{ user: Object, connections: Object[] }>} User info and their connections.
 * @throws Will throw an error if the request fails.
 */
export async function getUserConnections(userId) {
  try {
    const response = await api.get(`/users/${userId}/connections`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.error("getUserConnections error:", message);
    throw new Error(message);
  }
}

/**
 * Fetch detailed friend list for a specific user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object[]>} List of friends.
 * @throws Will throw an error if the request fails.
 */
export async function getUserFriendList(userId) {
  try {
    const response = await api.get(`/users/${userId}/friends`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.error("getUserFriendList error:", message);
    throw new Error(message);
  }
}

/**
 * Fetch list of incoming friend requests for a specific user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object[]>} List of incoming requests.
 * @throws Will throw an error if the request fails.
 */
export async function getIncomingRequests(userId) {
  try {
    const response = await api.get(`/users/${userId}/incoming-requests`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.error("getIncomingRequests error:", message);
    throw new Error(message);
  }
}

/**
 * Fetch list of outgoing friend requests for a specific user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object[]>} List of outgoing requests.
 * @throws Will throw an error if the request fails.
 */
export async function getOutgoingRequests(userId) {
  try {
    const response = await api.get(`/users/${userId}/outgoing-requests`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.error("getOutgoingRequests error:", message);
    throw new Error(message);
  }
}

/**
 * Cancel a sent friend request.
 * @param {string} userId - The ID of the sender.
 * @param {string} receiverId - The ID of the receiver.
 * @returns {Promise<Object>} Success message.
 * @throws Will throw an error if the request fails.
 */
export async function cancelFriendRequest(userId, receiverId) {
  try {
    const response = await api.delete(
      `/users/${userId}/cancel-request/${receiverId}`
    );
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.error("cancelFriendRequest error:", message);
    throw new Error(message);
  }
}

/**
 * Reject a received friend request.
 * @param {string} userId - The ID of the receiver.
 * @param {string} senderId - The ID of the sender.
 * @returns {Promise<Object>} Success message.
 * @throws Will throw an error if the request fails.
 */
export async function rejectFriendRequest(userId, senderId) {
  try {
    const response = await api.delete(
      `/users/${userId}/reject-request/${senderId}`
    );
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.error("rejectFriendRequest error:", message);
    throw new Error(message);
  }
}

/**
 * accept a received friend request.
 * @param {string} userId - The ID of the receiver.
 * @param {string} senderId - The ID of the sender.
 * @returns {Promise<Object>} Success message.
 * @throws Will throw an error if the request fails.
 */
export async function acceptFriendRequest(userId, senderId) {
  try {
    const response = await api.post(`/users/${senderId}/accept-request`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.error("acceptFriendRequest error:", message);
    throw new Error(message);
  }
}

/**
 * Send a friend request.
 * @param {string} senderId - The ID of the user sending the request.
 * @param {string} receiverId - The ID of the user to receive the request.
 * @returns {Promise<Object>} Success message.
 * @throws Will throw an error if the request fails.
 */
export async function sendFriendRequest(senderId, receiverId) {
  try {
    const response = await api.post(`/users/${receiverId}/send-request`, {
      receiverId,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.error("sendFriendRequest error:", message);
    throw new Error(message);
  }
}

/**
 * Unfriend a user.
 * @param {string} userId - The ID of the user performing the unfriend.
 * @param {string} friendId - The ID of the friend to remove.
 * @returns {Promise<Object>} Success message.
 * @throws Will throw an error if the request fails.
 */
export async function unfriendUser(userId, friendId) {
  try {
    const response = await api.delete(`/users/${friendId}/unfriend`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.error("unfriendUser error:", message);
    throw new Error(message);
  }
}

/**
 * Get info about any user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object>} User details.
 * @throws Will throw an error if the request fails.
 */
export async function getUser(userId) {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.error("getUser error:", message);
    throw new Error(message);
  }
}

/**
 * Update info about any user.
 * @param {string} userId - The ID of the user.
 * @param {Object} payload - The user data to update (e.g., name, gender, interests, age, profilePicture).
 * @returns {Promise<Object>} Updated user details.
 * @throws Will throw an error if the request fails.
 */
export async function updateUserInfo(userId, payload) {
  try {
    const response = await api.put(`/users/${userId}`, payload);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.error("updateUserInfo error:", message);
    throw new Error(message);
  }
}

/**
 * Uploads a profile picture for a user.
 * @param {string} userId - The ID of the user.
 * @param {File} file - The image file to upload.
 * @returns {Promise<string>} URL of the uploaded profile picture.
 * @throws Will throw an error if the request fails.
 */
export async function uploadUserProfilePicture(userId, file) {
  try {
    const formData = new FormData();
    formData.append("profilePicture", file);

    const response = await api.post(
      `/media/users/${userId}/profile-picture`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.error("uploadUserProfilePicture error:", message);
    throw new Error(message);
  }
}

/**
 * Fetches the profile picture for a user as a Blob.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Blob>} The image data as a Blob.
 * @throws Will throw an error if the request fails.
 */
export async function getUserProfilePicture(userId) {
  try {
    const response = await api.get(`/media/users/${userId}/profile-picture`, {
      responseType: "blob",
    });

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.error("getUserProfilePicture error:", message);
    throw new Error(message);
  }
}
