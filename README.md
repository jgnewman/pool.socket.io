# pool.socket.io

Clearer, simpler semantics for socket.io.

## What is pool.socket.io?

pool.socket.io is a layer that sits on top of socket.io, making the mechanics of
communication a whole lot clearer and also a bit easier. It's tiny too – less
than 50 lines of ES6 when you subtract the comments.

## How does it work?

pool.socket.io is great for the server side whereas traditional socket.io is
still fantastic for the client side. On the client side, you won't be managing
a pool of incoming connections from the server, so we didn't really need to
touch that. It'll work as it always has:

```javascript
<script src="/socket.io/socket.io.js"></script>
<script>
  var connection = io();
  connection.emit('CLIENT_EVENT', 'Sending a message.');
  connection.on('SERVER_EVENT', function (msg) {
    console.log(msg);
  });
</script>
```

On the other hand, your server may be managing a lot of clients at once. As
such, we've made it easier to conceptualize how to deal with that. With
pool.socket.io, you essentially get access to 3 objects:

1. A connection manager which allows you to describe the socket API available to each incoming connection.
2. The connection itself which allows you to listen for events on that connection and send messages back through that specific connection.
3. A pool object which is the traditional socket.io interface. In other words, it's what you get when you call `io(server)`.

With concerns divided in this way, we can create vastly more comprehensible
socket APIs. The following example uses Express to illustrate how
pool.socket.io plays nicely with other server frameworks.

```javascript
// Import the express framework, the native http library,
// and the `socketpool` function from pool.socket.io.
import express from 'express';
import http from 'http';
import socketpool from 'pool.socket.io';

// Create a server using express and then pass it to `socketpool`
// in order to generate our connectionManager. Traditionally,
// using socket.io, you would have called `io(server)` instead of
// `socketpool(server)`;
const app = express();
const server = new http.Server(app);
const connectionManager = socketpool(server);

// We call `onConnection` and pass it a function in order to
// create the API available to each incoming connection from a
// client. This function is passed an reference to the connection
// and also the full connection pool as arguments.
connectionManager.onConnection((connection, pool) => {

  // Now we can listen for events coming through the connection.
  // On the one hand, when an event comes through, we can `emit`
  // our own event back through that single connection. No other
  // connections will detect it.
  connection.on('CLIENT_EVENT', message => {
    connection.emit('SERVER_EVENT', 'Message received.');
  });

  // On the other hand, we can use `emit` on the `pool` object to
  // send our own event back to all connections in the pool.
  connection.on('ANOTHER_CLIENT_EVENT', message => {
    pool.emit('ANOTHER_SERVER_EVENT', 'For all connections.');
  });

  // We still have access to all of socket.io's built-in
  // events as well.
  connection.on('disconnect', () => {
    console.log(`A client disconnected from websocket | ${connection.id}`);
  });

});
```

## What can I do with it?

Here is a breakdown of the pool.socket.io API:

### The Connection Manager

#### `ConnectionManager#onConnection(apiFn)`

When there is a new connection opened, runs the provided function
in order to build the API for that connection. The provided
function will be handed references to both the single connection
as well as the overall pool.

**Arguments**

- `apiFn`: _Function_ - Describes the API to be used for a given connection.

**Returns**

The result of creating a socket.io `connection` handler.

#### `ConnectionManager#emit(event, message)`

Sends a message to all connections in the pool.

**Arguments**

- `event`: _String_ - The name of the event to send.
- `message`: _Any_ - The message associated with the event.

**Returns**

The result of calling Socket.io's `emit` method.

#### `ConnectionManager#emitTo(id, event, message)`

Sends a message to a single connection in the pool by ID.

**Arguments**

- `id`: _String_ - The ID of the connection to send a message to.
- `event`: _String_ - The name of the event to send.
- `message`: _Any_ - The message associated with the event.

**Returns**

The result of calling Socket.io's `emit` method.

### The Connection Object

#### `Connection#on(event, fn)`

Creates an event handler for a named event. The handler will be called with a
reference to the payload coming in through the connection.

**Arguments**

- `event`: _String_ - The name of the incoming event.
- `fn`: _Function_ - The procedure to be executed when the event comes through.

**Returns**

The result of calling Socket.io's `socket.on` method.

#### `Connection#emit(event, message)`

Sends a message only through this connection.

**Arguments**

- `event`: _String_ - The name of the event to send.
- `message`: _Any_ - The message associated with the event.

**Returns**

The result of calling Socket.io's `emit` method.

### The Pool Object

The pool object is the direct result of calling socket.io's `io(server)`. As
such, its methods are identical to those described in socket.io's
documentation and won't be repeated here. Suffice it to say, you can use this
object's `emit` method to send an event and message to all connections in the
pool at once.
