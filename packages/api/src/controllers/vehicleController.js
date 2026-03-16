const vehicleService = require('../services/vehicleService');

/**
 * VehicleController — thin HTTP interface.
 * Every function: receive request → call service → send response.
 * All business logic, DB queries, and authorization live in vehicleService.
 */

exports.createVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.create(req.body, req.user._id);
    res.status(201).json({ _id: vehicle._id, title: vehicle.title, message: 'Vehicle created successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getAllVehicles = async (req, res, next) => {
  try {
    const result = await vehicleService.getAll(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getVehiclesByType = async (req, res, next) => {
  try {
    const vehicles = await vehicleService.getByType(req.params.type);
    res.json(vehicles);
  } catch (error) {
    next(error);
  }
};

exports.getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.getById(req.params.id);
    res.json(vehicle);
  } catch (error) {
    next(error);
  }
};

exports.updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.update(req.params.id, req.body, req.user);
    res.json(vehicle);
  } catch (error) {
    next(error);
  }
};

exports.deleteVehicle = async (req, res, next) => {
  try {
    await vehicleService.delete(req.params.id, req.user);
    res.json({ message: 'Vehicle removed' });
  } catch (error) {
    next(error);
  }
};

exports.uploadVehicleImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Please upload files' });
    }
    const urls = await vehicleService.uploadImages(req.files, req.user._id);
    res.json({ urls });
  } catch (error) {
    next(error);
  }
};

exports.getUserVehicles = async (req, res, next) => {
  try {
    const vehicles = await vehicleService.getByUser(req.user._id);
    res.json(vehicles);
  } catch (error) {
    next(error);
  }
};

exports.getVehiclesForAdmin = async (req, res, next) => {
  try {
    const result = await vehicleService.getForAdmin(req.query, req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
};