const chatService = require('../services/chatService');
const notificationUtil = require('../utils/notificationUtil');

const chatController = {
  // Create a new chat
  createChat: async (req, res, next) => {
    try {
      const { vehicleId, sellerId } = req.body;
      const chat = await chatService.createChat([req.user._id, sellerId], vehicleId);
      res.status(201).json(chat);
    } catch (error) {
      next(error);
    }
  },

  // Get all chats for a user
  getUserChats: async (req, res, next) => {
    try {
      const chats = await chatService.getChatsByUser(req.user._id);
      res.json(chats);
    } catch (error) {
      next(error);
    }
  },

  // Get chat by ID
  getChatById: async (req, res, next) => {
    try {
      const chat = await chatService.getChatById(req.params.id);
      res.json(chat);
    } catch (error) {
      next(error);
    }
  },

  // Add a message to chat
  addMessage: async (req, res, next) => {
    try {
      const { content } = req.body;
      const chatId = req.params.id;
      
      // Lấy thông tin chat trước khi thêm tin nhắn để biết người nhận
      // chatService.getChatById đã throw NotFoundError nếu không tìm thấy
      const chatBefore = await chatService.getChatById(chatId);

      // Thêm tin nhắn vào chat
      const chat = await chatService.addMessage(chatId, req.user._id, content);
      
      // Xác định người nhận thông báo (người không gửi tin nhắn này)
      const receiver = chatBefore.participants.find(
        participant => participant._id.toString() !== req.user._id.toString()
      );
      
      // Nếu có người nhận, gửi thông báo cho họ
      if (receiver) {
        await notificationUtil.sendNewMessageNotification(
          receiver._id,
          req.user.full_name || 'Người dùng',
          chatId,
          content
        );
      }
      
      res.json(chat);
    } catch (error) {
      next(error);
    }
  },

  // Mark messages as read
  markMessagesAsRead: async (req, res, next) => {
    try {
      const chat = await chatService.markMessagesAsRead(req.params.id, req.user._id);
      res.json(chat);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = chatController;