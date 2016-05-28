/**
 * @module socketpool
 * @exports The SocketPool class
 *
 * Adds a light layer on top of Socket.io to make websocket interactions
 * easier and more semantic.
 */

import io from 'socket.io';

/**
 * Sends a message to a single socket connected to socket.io.
 *
 * @param  {Object} pool    The socket.io connection pool.
 * @param  {String} id      The socket's ID.
 * @param  {String} event   The name of the event to emit.
 * @param  {Any}    message The serializable message to send.
 *
 * @return {undefined}
 */
function emitTo(pool, id, event, message) {
  const socket = pool.sockets.connected[id];
  if (socket) {
    return socket.emit(event, message);
  } else {
    console.log(`Cannot emit ${event} to disconnected socket ${id}`);
  }
}

/**
 * @class
 *
 * Models a single websocket connection in the connection pool.
 */
class Connection {

  /**
   * @constructor
   *
   * Builds the class instance.
   *
   * @param  {Object} socket A Socket.io socket object.
   * @param  {Object} pool   The Socket.io pool.
   *
   * @return {undefined}
   */
  constructor(socket, pool) {
    this.socket = socket;
    this.id = socket.id;
    this.pool = pool;
  }

  /**
   * Create an event handler for a named event.
   *
   * @param  {String}   event The event name.
   * @param  {Function} fn    The handler.
   *
   * @return The result of calling `socket.on`.
   */
  on(event, fn) {
    return this.socket.on(event, fn);
  }

  /**
   * Trigger an event only on this particular connection.
   *
   * @param  {String} event   The event name.
   * @param  {Any}    message The data to send with the event.
   *
   * @return The result of calling Socket.io's `emit` method.
   */
  emit(event, message) {
    return emitTo(this.pool, this.id, event, message);
  }
}


/**
 * @class
 *
 * Models a pool of websocket connections.
 */
class SocketPool {

  /**
   * Builds the class instance.
   *
   * @param  {Object} server An Express server instance.
   *
   * @return {undefined}
   */
  constructor(server) {
    this.server = server;
    this.pool = io(server);
  }

  /**
   * When there is a new connection opened, run the provided function
   * in order to build the API for that connection. The provided
   * function will be handed references to both the single connection
   * as well as the overall pool.
   *
   * @param  {Function} apiFn Builds the API for the connection.
   *
   * @return The result of creating a Socket.io connection handler.
   */
  onConnection(apiFn) {
    return this.pool.on('connection', socket => {
      const connection = new Connection(socket, this.pool);
      apiFn(connection, this.pool);
    });
  }

  /**
   * Send a message to a single connection in the pool by ID.
   *
   * @param  {String} id      The ID of the connection to send a message to.
   * @param  {String} event   The name of the event to send.
   * @param  {Any}    message The message associated with the event.
   *
   * @return The result of calling Socket.io's `emit` method.
   */
  emitTo(id, event, message) {
    return emitTo(this.pool, id, event, message);
  }

  /**
   * Send a message to all connections in the pool.
   *
   * @param  {String} event   The name of the event to send.
   * @param  {Any}    message The message associated with the event.
   *
   * @return The result of calling Socket.io's `emit` method.
   */
  emit(event, message) {
    return this.pool.emit(event, message);
  }
}

/**
 * Creates a new socket pool and spins up an
 * instance of socket.io with the provided server.
 *
 * @param  {Server} server An http server.
 *
 * @return {SocketPool}
 */
export default function socketPool(server) {
  return new SocketPool(server);
}
