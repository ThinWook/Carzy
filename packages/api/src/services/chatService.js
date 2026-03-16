const mongoose = require('mongoose');
const chatRepository = require('../repositories/ChatRepository');
const userRepository = require('../repositories/UserRepository');
const vehicleRepository = require('../repositories/VehicleRepository');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class ChatService {
  async createChat(participants, vehicleId) {
    // Kiểm tra participants
    if (!Array.isArray(participants) || participants.length !== 2) {
      throw new BadRequestError('Participants phải là một mảng chứa đúng 2 ID người dùng');
    }

    // Kiểm tra tính hợp lệ của ID
    participants.forEach(id => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestError(`ID người dùng không hợp lệ: ${id}`);
      }
    });

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      throw new BadRequestError(`ID phương tiện không hợp lệ: ${vehicleId}`);
    }

    // Kiểm tra xem người dùng có tồn tại không
    // Sử dụng _id: { $in: participants } thông qua find của BaseRepository
    const users = await userRepository.find({ _id: { $in: participants } });
    if (users.length !== 2) {
      throw new NotFoundError('Một hoặc cả hai người dùng không tồn tại');
    }

    // Kiểm tra xem phương tiện có tồn tại không
    const vehicle = await vehicleRepository.findById(vehicleId);
    if (!vehicle) {
      throw new NotFoundError(`Không tìm thấy phương tiện với ID: ${vehicleId}`);
    }

    // Tìm cuộc trò chuyện hiện có
    const existingChat = await chatRepository.findExistingChat(participants, vehicleId);
    if (existingChat) {
      return existingChat;
    }

    // Tạo cuộc trò chuyện mới
    return await chatRepository.create({
      participants,
      vehicle: vehicleId
    });
  }

  async getChatsByUser(userId) {
    return await chatRepository.getChatsByUserWithDetails(userId);
  }

  async getChatById(chatId) {
    const chat = await chatRepository.getChatByIdWithDetails(chatId);
    if (!chat) throw new NotFoundError('Chat not found');
    return chat;
  }

  async addMessage(chatId, senderId, content) {
    // Lấy thông tin chat trước khi thêm tin nhắn để kiểm tra tồn tại
    const chat = await chatRepository.findById(chatId);
    if (!chat) {
      throw new NotFoundError('Chat not found');
    }

    // Thực hiện thêm tin nhắn qua Repository
    return await chatRepository.addMessage(chatId, senderId, content);
  }

  async markMessagesAsRead(chatId, userId) {
    const chat = await chatRepository.markMessagesAsRead(chatId, userId);
    if (!chat) {
      throw new NotFoundError('Chat not found');
    }
    return chat;
  }
}

module.exports = new ChatService();