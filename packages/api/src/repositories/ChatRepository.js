const BaseRepository = require('./base/BaseRepository');
const Chat = require('../models/Chat');

class ChatRepository extends BaseRepository {
  constructor() {
    super(Chat);
  }

  /**
   * Tìm cuộc trò chuyện dựa trên 2 người tham gia và phương tiện
   */
  async findExistingChat(participants, vehicleId) {
    return this.findOne({
      participants: { $all: participants },
      vehicle: vehicleId
    });
  }

  /**
   * Lấy danh sách cuộc trò chuyện của một người dùng
   */
  async getChatsByUserWithDetails(userId) {
    return this.model.find({ participants: userId })
      .populate('participants', 'full_name email avatar_url')
      .populate('vehicle', 'make model price images')
      .sort({ lastMessage: -1 });
  }

  /**
   * Lấy chi tiết một cuộc trò chuyện
   */
  async getChatByIdWithDetails(chatId) {
    return this.model.findById(chatId)
      .populate('participants', 'full_name email avatar_url')
      .populate('vehicle', 'make model price images');
  }

  /**
   * Thêm tin nhắn mới vào cuộc trò chuyện
   */
  async addMessage(chatId, senderId, content) {
    return this.model.findByIdAndUpdate(
      chatId,
      {
        $push: { messages: { sender: senderId, content } },
        $set: { lastMessage: new Date() }
      },
      { new: true }
    );
  }

  /**
   * Đánh dấu tất cả tin nhắn của đối phương trong cuộc trò chuyện là đã đọc
   */
  async markMessagesAsRead(chatId, userId) {
    const chat = await this.findById(chatId);
    if (!chat) return null;

    let hasUnread = false;
    chat.messages.forEach(message => {
      if (message.sender.toString() !== userId.toString() && !message.read) {
        message.read = true;
        hasUnread = true;
      }
    });

    if (hasUnread) {
      return chat.save();
    }
    return chat;
  }
}

module.exports = new ChatRepository();
