'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @module socketpool
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @exports The SocketPool class
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Adds a light layer on top of Socket.io to make websocket interactions
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * easier and more semantic.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

exports.default = socketPool;

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
function _emitTo(pool, id, event, message) {
  var socket = pool.sockets.connected[id];
  if (socket) {
    return socket.emit(event, message);
  } else {
    console.log('Cannot emit ' + event + ' to disconnected socket ' + id);
  }
}

/**
 * @class
 *
 * Models a single websocket connection in the connection pool.
 */

var Connection = function () {

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

  function Connection(socket, pool) {
    _classCallCheck(this, Connection);

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


  _createClass(Connection, [{
    key: 'on',
    value: function on(event, fn) {
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

  }, {
    key: 'emit',
    value: function emit(event, message) {
      return _emitTo(this.pool, this.id, event, message);
    }
  }]);

  return Connection;
}();

/**
 * @class
 *
 * Models a pool of websocket connections.
 */


var SocketPool = function () {

  /**
   * Builds the class instance.
   *
   * @param  {Object} server An Express server instance.
   *
   * @return {undefined}
   */

  function SocketPool(server) {
    _classCallCheck(this, SocketPool);

    this.server = server;
    this.pool = (0, _socket2.default)(server);
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


  _createClass(SocketPool, [{
    key: 'onConnection',
    value: function onConnection(apiFn) {
      var _this = this;

      return this.pool.on('connection', function (socket) {
        var connection = new Connection(socket, _this.pool);
        apiFn(connection, _this.pool);
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

  }, {
    key: 'emitTo',
    value: function emitTo(id, event, message) {
      return _emitTo(this.pool, id, event, message);
    }

    /**
     * Send a message to all connections in the pool.
     *
     * @param  {String} event   The name of the event to send.
     * @param  {Any}    message The message associated with the event.
     *
     * @return The result of calling Socket.io's `emit` method.
     */

  }, {
    key: 'emit',
    value: function emit(event, message) {
      return this.pool.emit(event, message);
    }
  }]);

  return SocketPool;
}();

/**
 * Creates a new socket pool and spins up an
 * instance of socket.io with the provided server.
 *
 * @param  {Server} server An http server.
 *
 * @return {SocketPool}
 */


function socketPool(server) {
  return new SocketPool(server);
}