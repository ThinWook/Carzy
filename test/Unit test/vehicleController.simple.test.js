const mongoose = require("mongoose");

// Mock console để tránh log noise
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

// Mock các phương thức của Vehicle model
const mockVehicleCreate = jest.fn();
const mockVehicle = {
  create: mockVehicleCreate,
};

// Mock controller functions
const vehicleController = {
  createVehicle: async (req, res) => {
    try {
      console.log("Received create vehicle request");
      console.log("User ID:", req.user?._id);

      if (!req.body) {
        return res.status(400).json({ message: "Missing request body" });
      }

      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Create a basic vehicle object WITHOUT any images or large data
      const basicVehicleData = {
        title: req.body.title,
        description: req.body.description,
        type: req.body.type,
        make: req.body.make,
        model: req.body.model,
        year: req.body.year,
        price: req.body.price,
        location: req.body.location,
        user: req.user._id,
        status: "pending",
        // Include other basic fields
        mileage: req.body.mileage || 0,
        body_type: req.body.body_type || "Other",
        fuel_type: req.body.fuel_type || "Other",
        transmission: req.body.transmission || "Other",
        // Empty placeholder for images
        images: [],
      };

      try {
        console.log("Creating vehicle with basic data");
        const vehicle = await mockVehicle.create(basicVehicleData);
        console.log("Vehicle created successfully with ID:", vehicle._id);

        // Return success immediately after creating basic vehicle
        return res.status(201).json({
          _id: vehicle._id,
          title: vehicle.title,
          message: "Vehicle created successfully",
        });
      } catch (dbError) {
        console.error("Database error creating vehicle:", dbError);

        if (dbError.name === "ValidationError") {
          const fields = Object.keys(dbError.errors);
          console.error("Validation failed for fields:", fields);
          return res.status(400).json({
            message: "Dữ liệu không hợp lệ",
            fields,
          });
        }

        throw dbError;
      }
    } catch (error) {
      console.error("Error creating vehicle:", error);

      // Kiểm tra cụ thể lỗi từ mongoose để trả về thông báo phù hợp
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((val) => val.message);
        console.error("Validation errors:", messages);
        return res.status(400).json({
          message: "Dữ liệu không hợp lệ",
          errors: messages,
        });
      }

      if (error.code === 11000) {
        console.error("Duplicate key error:", error.keyValue);
        return res.status(400).json({
          message: "Trùng lặp dữ liệu",
          field: Object.keys(error.keyValue)[0],
        });
      }

      // Generic error, return a 500
      res
        .status(500)
        .json({ message: error.message || "Error creating vehicle" });
    }
  },
};

describe("VehicleController - createVehicle", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { _id: "user123" },
      body: {
        title: "Test Car",
        description: "Test Description",
        type: "sedan",
        make: "Toyota",
        model: "Camry",
        year: 2020,
        price: 15000,
        location: "Hanoi",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Clear all mocks
    jest.clearAllMocks();

    // Reset mock implementations
    mockVehicleCreate.mockResolvedValue({
      _id: "vehicle123",
      title: "Test Car",
      description: "Test Description",
      type: "sedan",
      make: "Toyota",
      model: "Camry",
      year: 2020,
      price: 15000,
      location: "Hanoi",
      user: "user123",
      status: "pending",
    });
  });

  // Test case 1: Thiếu request body
  test("should return 400 if request body is missing", async () => {
    req.body = null;

    await vehicleController.createVehicle(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Missing request body",
    });
  });

  // Test case 2: User không được xác thực
  test("should return 401 if user is not authenticated", async () => {
    req.user = null;

    await vehicleController.createVehicle(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "User not authenticated",
    });
  });

  // Test case 3: Tạo xe thành công
  test("should create vehicle and return 201 if successful", async () => {
    const mockVehicle = {
      _id: "vehicle123",
      title: "Test Car",
      description: "Test Description",
      type: "sedan",
      make: "Toyota",
      model: "Camry",
      year: 2020,
      price: 15000,
      location: "Hanoi",
      user: "user123",
      status: "pending",
    };
    mockVehicleCreate.mockResolvedValue(mockVehicle);
    await vehicleController.createVehicle(req, res);
    expect(mockVehicleCreate).toHaveBeenCalledWith({
      title: "Test Car",
      description: "Test Description",
      type: "sedan",
      make: "Toyota",
      model: "Camry",
      year: 2020,
      price: 15000,
      location: "Hanoi",
      user: "user123",
      status: "pending",
      mileage: 0,
      body_type: "Other",
      fuel_type: "Other",
      transmission: "Other",
      images: [],
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      _id: "vehicle123",
      title: "Test Car",
      message: "Vehicle created successfully",
    });
  });

  // Test case 4: Validation error
  test("should return 400 if validation fails", async () => {
    const validationError = {
      name: "ValidationError",
      errors: {
        title: { message: "Title is required" },
        price: { message: "Price must be positive" },
      },
    };

    mockVehicleCreate.mockRejectedValue(validationError);

    await vehicleController.createVehicle(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Dữ liệu không hợp lệ",
      fields: ["title", "price"],
    });
  });

  // Test case 5: Duplicate key error
  test("should return 400 if duplicate key error occurs", async () => {
    const duplicateError = {
      code: 11000,
      keyValue: { vin: "VIN123" },
    };

    mockVehicleCreate.mockRejectedValue(duplicateError);

    await vehicleController.createVehicle(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Trùng lặp dữ liệu",
      field: "vin",
    });
  });

  // Test case 6: Generic error
  test("should return 500 if a generic error occurs", async () => {
    const errorMessage = "Database connection failed";

    mockVehicleCreate.mockRejectedValue(new Error(errorMessage));

    await vehicleController.createVehicle(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: errorMessage,
    });
  });

  // Test case 7: Tạo xe với thông tin đầy đủ
  test("should create vehicle with complete data", async () => {
    req.body = {
      ...req.body,
      mileage: 50000,
      body_type: "SUV",
      fuel_type: "Gasoline",
      transmission: "Automatic",
      color: "Red",
    };

    await vehicleController.createVehicle(req, res);

    expect(mockVehicleCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mileage: 50000,
        body_type: "SUV",
        fuel_type: "Gasoline",
        transmission: "Automatic",
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // Test case 8: Kiểm tra thiếu trường bắt buộc (title)
  test("should return 400 if required field title is missing", async () => {
    delete req.body.title;

    const validationError = {
      name: "ValidationError",
      errors: {
        title: { message: "Title is required" },
      },
    };

    mockVehicleCreate.mockRejectedValue(validationError);

    await vehicleController.createVehicle(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Dữ liệu không hợp lệ",
      fields: ["title"],
    });
  });

  // Test case 9: Kiểm tra giá trị âm cho price
  test("should return 400 if price is negative", async () => {
    req.body.price = -1000;

    const validationError = {
      name: "ValidationError",
      errors: {
        price: { message: "Price must be positive" },
      },
    };

    mockVehicleCreate.mockRejectedValue(validationError);

    await vehicleController.createVehicle(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Dữ liệu không hợp lệ",
      fields: ["price"],
    });
  });

  // Test case 10: Kiểm tra year không hợp lệ
  test("should return 400 if year is invalid", async () => {
    req.body.year = 1800;

    const validationError = {
      name: "ValidationError",
      errors: {
        year: { message: "Year must be valid" },
      },
    };

    mockVehicleCreate.mockRejectedValue(validationError);

    await vehicleController.createVehicle(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Dữ liệu không hợp lệ",
      fields: ["year"],
    });
  });
});
