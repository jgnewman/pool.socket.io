# socket.pool

Clearer, simpler semantics for socket.io.

## What is socket.pool?

Socket.pool is a layer that sits on top of socket.io, making the mechanics of
communication a whole lot clearer and also a bit easier. It's tiny too – only
44 lines of ES6 when you subtract the comments.

## How does it work?

Socket.pool is great for the server side whereas socket.io is still fantastic
for the client side. On the client side, you won't be managing a pool of
incoming connections from the server, so we didn't really need to touch that.

```javascript
<script src="/socket.io/socket.io.js"></script>
<script>
  var socket = io();
  socket.emit('CLIENT_EVENT', 'Sending a message.');
  socket.on('SERVER_EVENT', function (msg) {
    console.log(msg);
  });
</script>
```

On the other hand, your server may be managing a lot of clients at once. As
such, we've made it easier to conceptualize how you're dealing with that. You
have a pool that manages new connections and disconnections, as well as the
ability to send messages to all connections in the pool. For each connection,
you have the ability to handle individual communication. You'd set that up
like this:

```javascript
import express from 'express';
import http from 'http';
import socketPool from 'socket.pool';

const app = express();
const server = new http.Server(app);
const sp = socketPool(server);
```
