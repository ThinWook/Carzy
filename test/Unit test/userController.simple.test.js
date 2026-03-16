const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// Mock console để tránh log noise
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

// Mock mongoose.Types.ObjectId.isValid
const mockIsValid = jest.fn();
mongoose.Types.ObjectId = {
  isValid: mockIsValid,
};

// Mock các phương thức của User model
const mockUserFindOne = jest.fn();
const mockUserMatchPassword = jest.fn();

// Mock User model
const mockUserModel = {
  findOne: mockUserFindOne,
};

// Mock jwt
const mockJwtSign = jest.fn();

// Mock controller functions
const userController = {
  // Login user
  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find the user by email
      const user = await mockUserModel.findOne({ email });
      if (!user) {
        return res
          .status(401)
          .json({ message: "Email hoặc mật khẩu không đúng" });
      }

      // Check if user is locked
      if (user.is_locked) {
        return res
          .status(401)
          .json({
            message: "Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên",
          });
      }

      // Check password
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Email hoặc mật khẩu không đúng" });
      }

      // Generate JWT token
      const token = mockJwtSign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });

      // Return user (excluding password)
      res.json({
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        address: user.address,
        role: user.role,
        avatar_url: user.avatar_url,
        cover_image_url: user.cover_image_url,
        rating: user.rating,
        created_at: user.created_at,
        token,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};

describe("UserController - loginUser", () => {
  let req, res;
  beforeEach(() => {
    req = {
      body: {
        email: "test@example.com",
        password: "password123",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    // Clear all mocks
    jest.clearAllMocks();
    // Reset mock implementations
    mockUserFindOne.mockResolvedValue(null);
    mockJwtSign.mockReturnValue("mock-jwt-token");
  });

  // Test case 1: User không tồn tại
  test("should return 401 if user does not exist", async () => {
    mockUserFindOne.mockResolvedValue(null);

    await userController.loginUser(req, res);

    expect(mockUserFindOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email hoặc mật khẩu không đúng",
    });
  });

  // Test case 2: User bị khóa
  test("should return 401 if user is locked", async () => {
    const mockUser = {
      _id: "user123",
      email: "test@example.com",
      is_locked: true,
      matchPassword: jest.fn().mockResolvedValue(true),
    };

    mockUserFindOne.mockResolvedValue(mockUser);

    await userController.loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên",
    });
  });

  // Test case 3: Mật khẩu không khớp
  test("should return 401 if password does not match", async () => {
    const mockUser = {
      _id: "user123",
      email: "test@example.com",
      is_locked: false,
      matchPassword: jest.fn().mockResolvedValue(false),
    };

    mockUserFindOne.mockResolvedValue(mockUser);

    await userController.loginUser(req, res);

    expect(mockUser.matchPassword).toHaveBeenCalledWith("password123");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email hoặc mật khẩu không đúng",
    });
  });

  // Test case 4: Đăng nhập thành công
  test("should return user data and token if login is successful", async () => {
    const mockUser = {
      _id: "user123",
      full_name: "Test User",
      email: "test@example.com",
      phone_number: "1234567890",
      address: "Test Address",
      role: "user",
      avatar_url: "avatar.jpg",
      cover_image_url: "cover.jpg",
      rating: 4.5,
      created_at: new Date(),
      is_locked: false,
      matchPassword: jest.fn().mockResolvedValue(true),
    };

    const mockToken = "mock-jwt-token";

    mockUserFindOne.mockResolvedValue(mockUser);
    mockJwtSign.mockReturnValue(mockToken);

    await userController.loginUser(req, res);

    expect(mockUser.matchPassword).toHaveBeenCalledWith("password123");
    expect(mockJwtSign).toHaveBeenCalledWith(
      { id: "user123" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    expect(res.json).toHaveBeenCalledWith({
      _id: "user123",
      full_name: "Test User",
      email: "test@example.com",
      phone_number: "1234567890",
      address: "Test Address",
      role: "user",
      avatar_url: "avatar.jpg",
      cover_image_url: "cover.jpg",
      rating: 4.5,
      created_at: mockUser.created_at,
      token: mockToken,
    });
  });

  // Test case 5: Exception handling
  test("should return 400 if an error occurs", async () => {
    const errorMessage = "Database error";
    mockUserFindOne.mockRejectedValue(new Error(errorMessage));

    await userController.loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
  });

  // Test case 6: Kiểm tra email rỗng
  test("should return 401 if email is empty", async () => {
    req.body.email = "";
    mockUserFindOne.mockResolvedValue(null);

    await userController.loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email hoặc mật khẩu không đúng",
    });
  });

  // Test case 7: Kiểm tra password rỗng
  test("should return 401 if password is empty", async () => {
    req.body.password = "";
    const mockUser = {
      _id: "user123",
      email: "test@example.com",
      is_locked: false,
      matchPassword: jest.fn().mockResolvedValue(false),
    };
    mockUserFindOne.mockResolvedValue(mockUser);

    await userController.loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email hoặc mật khẩu không đúng",
    });
  });

  // Test case 8: Kiểm tra user với role admin
  test("should login successfully with admin role", async () => {
    const mockUser = {
      _id: "admin123",
      full_name: "Admin User",
      email: "admin@example.com",
      phone_number: "9876543210",
      address: "Admin Address",
      role: "admin",
      avatar_url: "admin-avatar.jpg",
      cover_image_url: "admin-cover.jpg",
      rating: 5.0,
      created_at: new Date(),
      is_locked: false,
      matchPassword: jest.fn().mockResolvedValue(true),
    };

    mockUserFindOne.mockResolvedValue(mockUser);
    mockJwtSign.mockReturnValue("admin-token");

    await userController.loginUser(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        role: "admin",
        token: "admin-token",
      })
    );
  });

  // Test case 9: Kiểm tra lỗi khi matchPassword throws error
  test("should return 400 if matchPassword throws error", async () => {
    const mockUser = {
      _id: "user123",
      email: "test@example.com",
      is_locked: false,
      matchPassword: jest
        .fn()
        .mockRejectedValue(new Error("Password comparison failed")),
    };

    mockUserFindOne.mockResolvedValue(mockUser);

    await userController.loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Password comparison failed",
    });
  });

  // Test case 10: Kiểm tra token generation với custom expiry
  test("should generate token with correct user id", async () => {
    const mockUser = {
      _id: "unique-user-id-123",
      full_name: "Unique User",
      email: "unique@example.com",
      phone_number: "1111111111",
      address: "Unique Address",
      role: "user",
      avatar_url: null,
      cover_image_url: null,
      rating: 3.5,
      created_at: new Date(),
      is_locked: false,
      matchPassword: jest.fn().mockResolvedValue(true),
    };

    mockUserFindOne.mockResolvedValue(mockUser);
    mockJwtSign.mockReturnValue("unique-token");

    await userController.loginUser(req, res);

    expect(mockJwtSign).toHaveBeenCalledWith(
      { id: "unique-user-id-123" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: "unique-user-id-123",
        token: "unique-token",
      })
    );
  });
});
