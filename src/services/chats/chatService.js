import api from "../config/axiosConfig";

/**
 * Get messages of users.
 * @param {string} senderId - The ID of the sender.
 * @param {string} receiverId - The ID of the receiver.
 * @returns {Promise<Object>[]} message list.
 * @throws Will throw an error if the request fails.
 */
export async function getMessages(senderId, receiverId) {
  try {
    const response = await api.get(`/messages/${senderId}/${receiverId}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.error("getMessages error:", message);
    throw new Error(message);
  }
}
