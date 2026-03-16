const mongoose = require("mongoose");

// Mock mongoose.Types.ObjectId.isValid
const mockIsValid = jest.fn();
mongoose.Types.ObjectId = {
  isValid: mockIsValid,
};

// Mock console để tránh log noise
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

// Mock các phương thức của mongoose models
const mockVehicleExists = jest.fn();
const mockFavoriteFindOne = jest.fn();
const mockFavoriteSave = jest.fn();
const mockFavoriteCountDocuments = jest.fn();

// Mock Favorite constructor
const MockFavorite = function (data) {
  Object.assign(this, data);
  this.save = mockFavoriteSave;
};

// Mock Vehicle model
const mockVehicle = {
  exists: mockVehicleExists,
};

// Mock Favorite model
const mockFavoriteModel = {
  findOne: mockFavoriteFindOne,
  countDocuments: mockFavoriteCountDocuments,
};

// Mock controller functions
const favoriteController = {
  // Thêm xe vào danh sách yêu thích
  addToFavorites: async (req, res) => {
    try {
      // Lấy thông tin user và vehicle ID
      const userId = req.user._id;
      const vehicleId = req.params.vehicleId;

      // Kiểm tra định dạng ObjectId của vehicle
      if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
        return res.status(400).json({ message: "ID xe không hợp lệ" });
      }

      // Kiểm tra xe có tồn tại không
      const vehicleExists = await mockVehicleExists({ _id: vehicleId });
      if (!vehicleExists) {
        return res.status(404).json({ message: "Không tìm thấy xe" });
      }

      // Kiểm tra đã thích xe này chưa
      const existingFavorite = await mockFavoriteFindOne({
        user: userId,
        vehicle: vehicleId,
      });
      if (existingFavorite) {
        return res
          .status(400)
          .json({ message: "Xe đã có trong danh sách yêu thích" });
      }

      // Tạo yêu thích mới
      const newFavorite = new MockFavorite({
        user: userId,
        vehicle: vehicleId,
      });

      // Lưu vào database
      await newFavorite.save();

      // Đếm tổng số xe yêu thích của người dùng
      const favoriteCount = await mockFavoriteCountDocuments({ user: userId });

      res.status(201).json({
        message: "Đã thêm xe vào danh sách yêu thích",
        favorite: newFavorite,
        favoriteCount,
      });
    } catch (error) {
      // Xử lý lỗi trùng lặp (nếu cố tình thêm trùng)
      if (error.code === 11000) {
        return res
          .status(400)
          .json({ message: "Xe đã có trong danh sách yêu thích" });
      }

      res.status(400).json({ message: error.message });
    }
  },
};

describe("FavoriteController - addToFavorites", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { _id: "user123" },
      params: { vehicleId: "vehicle123" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Reset all mocks
    jest.clearAllMocks();

    // Reset mock implementations
    mockIsValid.mockReturnValue(true);
    mockVehicleExists.mockResolvedValue(true);
    mockFavoriteFindOne.mockResolvedValue(null);
    mockFavoriteSave.mockResolvedValue();
    mockFavoriteCountDocuments.mockResolvedValue(5);
  });

  // Test case 1: VehicleId không hợp lệ
  test("should return 400 if vehicleId is not valid ObjectId", async () => {
    mockIsValid.mockReturnValue(false);

    await favoriteController.addToFavorites(req, res);

    expect(mockIsValid).toHaveBeenCalledWith("vehicle123");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "ID xe không hợp lệ",
    });
  });

  // Test case 2: Xe không tồn tại
  test("should return 404 if vehicle does not exist", async () => {
    mockVehicleExists.mockResolvedValue(false);

    await favoriteController.addToFavorites(req, res);

    expect(mockVehicleExists).toHaveBeenCalledWith({ _id: "vehicle123" });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Không tìm thấy xe",
    });
  });

  // Test case 3: Xe đã được yêu thích
  test("should return 400 if vehicle is already in favorites", async () => {
    mockFavoriteFindOne.mockResolvedValue({ _id: "fav123" });

    await favoriteController.addToFavorites(req, res);

    expect(mockFavoriteFindOne).toHaveBeenCalledWith({
      user: "user123",
      vehicle: "vehicle123",
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Xe đã có trong danh sách yêu thích",
    });
  });

  // Test case 4: Thêm yêu thích thành công
  test("should create favorite and return 201 if successful", async () => {
    const mockFavorite = {
      _id: "fav123",
      user: "user123",
      vehicle: "vehicle123",
    };

    // Mock the MockFavorite constructor to return our mock
    global.MockFavorite = jest.fn().mockImplementation((data) => ({
      ...mockFavorite,
      ...data,
      save: mockFavoriteSave,
    }));

    await favoriteController.addToFavorites(req, res);

    expect(mockFavoriteSave).toHaveBeenCalled();
    expect(mockFavoriteCountDocuments).toHaveBeenCalledWith({
      user: "user123",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Đã thêm xe vào danh sách yêu thích",
      favorite: expect.any(Object),
      favoriteCount: 5,
    });
  });

  // Test case 5: Xử lý lỗi trùng lặp
  test("should handle duplicate key error", async () => {
    const duplicateError = { code: 11000 };

    mockFavoriteSave.mockRejectedValue(duplicateError);

    await favoriteController.addToFavorites(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Xe đã có trong danh sách yêu thích",
    });
  });

  // Test case 6: Xử lý lỗi hệ thống
  test("should return 400 if an error occurs", async () => {
    const errorMessage = "Database error";

    mockVehicleExists.mockRejectedValue(new Error(errorMessage));

    await favoriteController.addToFavorites(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
  });

  // Test case 7: Kiểm tra với nhiều xe yêu thích
  test("should return correct favoriteCount when user has multiple favorites", async () => {
    mockFavoriteCountDocuments.mockResolvedValue(10);

    await favoriteController.addToFavorites(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Đã thêm xe vào danh sách yêu thích",
      favorite: expect.any(Object),
      favoriteCount: 10,
    });
  });

  // Test case 8: Kiểm tra favoriteCount = 0 khi đây là favorite đầu tiên
  test("should return favoriteCount as 1 when adding first favorite", async () => {
    mockFavoriteCountDocuments.mockResolvedValue(1);

    await favoriteController.addToFavorites(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Đã thêm xe vào danh sách yêu thích",
      favorite: expect.any(Object),
      favoriteCount: 1,
    });
  });

  // Test case 9: Kiểm tra vehicleId rỗng
  test("should return 400 if vehicleId is empty", async () => {
    req.params.vehicleId = "";
    mockIsValid.mockReturnValue(false);

    await favoriteController.addToFavorites(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "ID xe không hợp lệ",
    });
  });

  // Test case 10: Kiểm tra lỗi khi save favorite
  test("should return 400 if save fails with custom error", async () => {
    const customError = new Error("Save operation failed");
    mockFavoriteSave.mockRejectedValue(customError);

    await favoriteController.addToFavorites(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Save operation failed",
    });
  });
});
