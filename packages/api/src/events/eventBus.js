const EventEmitter = require('events');

/**
 * Singleton event bus for decoupled communication between services.
 * Implements the Observer pattern — emitters don't know who listens.
 *
 * Usage:
 *   emit: eventBus.emit('vehicle:approved', { vehicle, userId })
 *   listen: eventBus.on('vehicle:approved', handler)
 */
const eventBus = new EventEmitter();

// Prevent Node.js memory leak warning for high listener counts
eventBus.setMaxListeners(20);

module.exports = eventBus;
