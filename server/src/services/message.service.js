import Message from '../models/message.model.js';
import Users from '../models/user.model.js';

export const getUsersExcludingLoggedIn = async (loggedInUserId) => {
  try {
    const users = await Users.find({ _id: { $ne: loggedInUserId } }).select(
      '-password'
    );
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    // Return a structured error response
    return {
      success: false,
      message: 'Failed to fetch users: ' + error.message,
    };
  }
};

export const getChatMessages = async (myId, userToChatId) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    // Return a structured error response
    return 'Failed to fetch messages: ' + error.message;
  }
};

export const createMessage = async ({ senderId, receiverId, text }) => {
  const newMessage = new Message({ senderId, receiverId, text });
  return await newMessage.save();
};
