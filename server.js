const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")
const { Server } = require("socket.io")

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = 3000

const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(handler)

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  })

  // Store active connections by conversation
  const conversationRooms = new Map()

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id)

    // Join conversation room
    socket.on("join_conversation", (data) => {
      const { conversationId, userId } = data

      socket.join(conversationId)
      socket.userId = userId
      socket.conversationId = conversationId

      // Track users in conversation
      if (!conversationRooms.has(conversationId)) {
        conversationRooms.set(conversationId, new Set())
      }
      conversationRooms.get(conversationId).add(socket.id)

      console.log(`User ${userId} joined conversation ${conversationId}`)

      // Notify others in the conversation
      socket.to(conversationId).emit("user_joined", {
        userId,
        socketId: socket.id,
      })

      // Send confirmation
      socket.emit("joined_conversation", { conversationId })
    })

    // Handle new messages
    socket.on("send_message", async (data) => {
      try {
        const { conversationId, content, senderId, tempId } = data

        // Here you would typically save to database
        // For now, we'll simulate the database save
        const message = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          conversationId,
          content,
          senderId,
          createdAt: new Date().toISOString(),
          isRead: false,
          sender: {
            id: senderId,
            name: "User", // You'd get this from your database
          },
        }

        // Broadcast to all users in the conversation
        io.to(conversationId).emit("new_message", {
          message,
          tempId, // Include tempId to replace optimistic message
        })

        console.log(`Message sent in conversation ${conversationId}:`, content)
      } catch (error) {
        console.error("Error handling message:", error)
        socket.emit("message_error", {
          error: "Failed to send message",
          tempId: data.tempId,
        })
      }
    })

    // Handle typing indicators
    socket.on("typing_start", (data) => {
      socket.to(data.conversationId).emit("user_typing", {
        userId: socket.userId,
        isTyping: true,
      })
    })

    socket.on("typing_stop", (data) => {
      socket.to(data.conversationId).emit("user_typing", {
        userId: socket.userId,
        isTyping: false,
      })
    })

    // Handle message read status
    socket.on("mark_messages_read", (data) => {
      const { conversationId, messageIds } = data

      // Update database here
      // Then notify other users
      socket.to(conversationId).emit("messages_read", {
        messageIds,
        readBy: socket.userId,
      })
    })

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id)

      if (socket.conversationId) {
        const room = conversationRooms.get(socket.conversationId)
        if (room) {
          room.delete(socket.id)
          if (room.size === 0) {
            conversationRooms.delete(socket.conversationId)
          }
        }

        // Notify others in the conversation
        socket.to(socket.conversationId).emit("user_left", {
          userId: socket.userId,
          socketId: socket.id,
        })
      }
    })
  })

  httpServer
    .once("error", (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
