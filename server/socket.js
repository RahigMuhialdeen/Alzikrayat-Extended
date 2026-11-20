const { Server } = require('socket.io');
const mongoose = require('mongoose');

// Every photo detail page has its own room: "photo:<photoId>"
const ROOM_PREFIX = 'photo:';
const roomName = (photoId) => `${ROOM_PREFIX}${photoId}`;

// Attach Socket.io to the existing HTTP server (shared with Express)
const initSocket = (httpServer, clientUrl) => {
    const io = new Server(httpServer, {
        cors: {
            origin: clientUrl,
            credentials: true
        }
    });

    // Number of clients currently looking at a photo
    const viewersIn = (photoId) =>
        io.sockets.adapter.rooms.get(roomName(photoId))?.size || 0;

    const broadcastViewers = (photoId) => {
        io.to(roomName(photoId)).emit('room:viewers', {
            photoId,
            count: viewersIn(photoId)
        });
    };

    io.on('connection', (socket) => {
        // Client opened a photo detail page
        socket.on('photo:join', (photoId, ack) => {
            if (
                typeof photoId !== 'string' ||
                !mongoose.Types.ObjectId.isValid(photoId)
            ) {
                if (typeof ack === 'function') {
                    ack({ ok: false, message: 'Invalid photo ID' });
                }
                return;
            }

            // A client views one photo at a time: leave any previous room
            for (const room of socket.rooms) {
                if (room.startsWith(ROOM_PREFIX) && room !== roomName(photoId)) {
                    const previousId = room.slice(ROOM_PREFIX.length);
                    socket.leave(room);
                    broadcastViewers(previousId);
                }
            }

            socket.join(roomName(photoId));
            broadcastViewers(photoId);

            if (typeof ack === 'function') {
                ack({ ok: true });
            }
        });

        // Client left the photo detail page
        socket.on('photo:leave', (photoId) => {
            if (typeof photoId !== 'string') {
                return;
            }

            socket.leave(roomName(photoId));
            broadcastViewers(photoId);
        });

        // Tab closed / connection lost: tell the others in the room.
        // The socket is still in its rooms at this point, so subtract it.
        socket.on('disconnecting', () => {
            for (const room of socket.rooms) {
                if (room.startsWith(ROOM_PREFIX)) {
                    const photoId = room.slice(ROOM_PREFIX.length);
                    socket.to(room).emit('room:viewers', {
                        photoId,
                        count: viewersIn(photoId) - 1
                    });
                }
            }
        });
    });

    return io;
};

// Emit to everyone viewing one photo
const emitToPhoto = (io, photoId, event, payload) => {
    if (!io) {
        return;
    }

    io.to(roomName(String(photoId))).emit(event, payload);
};

// Emit to every connected client
const emitToAll = (io, event, payload) => {
    if (!io) {
        return;
    }

    io.emit(event, payload);
};

module.exports = {
    initSocket,
    emitToPhoto,
    emitToAll
};
