const eventBus = require('../eventBus');
const notificationUtil = require('../../utils/notificationUtil');
const logger = require('../../utils/logger');

/**
 * Vehicle event handlers — subscribe to vehicle lifecycle events.
 * This decouples notification logic from vehicleService/Controller.
 */

eventBus.on('vehicle:approved', async ({ vehicle, userId }) => {
  try {
    await notificationUtil.sendVehicleApprovedNotification(vehicle, userId);
    logger.info('Vehicle approved notification sent', { vehicleId: vehicle._id, userId });
  } catch (error) {
    logger.error('Failed to send vehicle approved notification', { error: error.message });
  }
});

eventBus.on('vehicle:rejected', async ({ vehicle, userId, reason }) => {
  try {
    await notificationUtil.sendVehicleRejectedNotification(vehicle, userId, reason);
    logger.info('Vehicle rejected notification sent', { vehicleId: vehicle._id, userId });
  } catch (error) {
    logger.error('Failed to send vehicle rejected notification', { error: error.message });
  }
});

logger.debug('Vehicle event handlers registered');
