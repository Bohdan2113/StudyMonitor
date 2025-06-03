import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import cors from "cors";
import { ObjectId } from "mongodb";
import { connectToDatabase, getDb } from "./db.js";

const app = express();
app.use(cors({ origin: "*" })); // Налаштуйте для вашого домену PHP в production
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const onlineUsers = new Map(); // username -> WebSocket_client

async function main() {
  await connectToDatabase();
  const db = getDb();
  const chatRoomsCollection = db.collection("chatrooms");
  const messagesCollection = db.collection("messages");
  const chatUserActivityCollection = db.collection("chatUserActivity"); // Нова колекція

  // Створимо індекси для нової колекції для швидкого пошуку
  await chatUserActivityCollection.createIndex(
    { chatId: 1, userId: 1 },
    { unique: true }
  );

  wss.on("connection", (ws) => {
    let currentUsername = null;

    // Функція для оновлення lastSeenTimestamp
    async function updateUserChatActivity(chatId, userId) {
      try {
        await chatUserActivityCollection.updateOne(
          { chatId: new ObjectId(chatId), userId: userId },
          { $set: { lastSeenTimestamp: new Date() } },
          { upsert: true } // Створити документ, якщо його немає
        );
        console.log(
          `SERVER: Updated lastSeen for user ${userId} in chat ${chatId}`
        );
      } catch (error) {
        console.error(
          `SERVER: Error updating user chat activity for ${userId}, chat ${chatId}:`,
          error
        );
      }
    }

    ws.on("message", async (message) => {
      const data = JSON.parse(message.toString());
      console.log(`Received from ${currentUsername || "unregistered"}:`, data);

      try {
        switch (data.type) {
          case "register":
            currentUsername = data.username;
            if (!currentUsername) {
              // ... (обробка помилки)
              return;
            }
            onlineUsers.set(currentUsername, ws);
            console.log(
              `User registered: ${currentUsername}. Total online: ${onlineUsers.size}`
            );

            // Надіслати існуючі чати користувачу
            const userChats = await chatRoomsCollection
              .find({ members: currentUsername })
              .sort({ lastActivity: -1 })
              .toArray();

            // Для кожного чату перевіряємо наявність непрочитаних повідомлень
            const chatsWithUnreadStatus = await Promise.all(
              userChats.map(async (chatRoom) => {
                const userActivity = await chatUserActivityCollection.findOne({
                  chatId: chatRoom._id,
                  userId: currentUsername,
                });
                const lastSeen = userActivity
                  ? userActivity.lastSeenTimestamp
                  : new Date(0); // Якщо не бачив, то всі повідомлення нові

                // Рахуємо повідомлення, новіші за lastSeen
                // Або просто перевіряємо, чи є хоча б одне таке повідомлення для швидкості
                const unreadMessagesCount =
                  await messagesCollection.countDocuments({
                    chatId: chatRoom._id,
                    timestamp: { $gt: lastSeen },
                    senderUsername: { $ne: currentUsername }, // Не рахувати власні повідомлення як непрочитані
                  });

                return {
                  chatRoom,
                  hasUnreadMessages: unreadMessagesCount > 0,
                };
              })
            );

            console.log(
              `SERVER: Sending initialChatRooms for ${currentUsername}:`,
              chatsWithUnreadStatus
            );
            ws.send(
              JSON.stringify({
                type: "initialChatRooms",
                rooms: chatsWithUnreadStatus,
              })
            );
            break;

          case "createChat": {
            const { memberUsernames, chatName, type } = data.payload;
            if (!currentUsername || !memberUsernames || !type) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  message: "Missing data for chat creation.",
                })
              );
              return;
            }

            const allMemberIds = Array.from(
              new Set([currentUsername, ...memberUsernames])
            );

            if (type === "direct" && allMemberIds.length === 2) {
              const existingDirectChat = await chatRoomsCollection.findOne({
                type: "direct",
                members: { $all: allMemberIds, $size: 2 },
              });
              if (existingDirectChat) {
                ws.send(
                  JSON.stringify({
                    type: "chatCreationFailed",
                    message: "Direct chat already exists.",
                    existingChat: existingDirectChat,
                  })
                );
                return;
              }
            }

            const newChatRoom = {
              name: type === "group" ? chatName : null,
              type: type,
              members: allMemberIds,
              createdBy: currentUsername,
              createdAt: new Date(),
              lastActivity: new Date(),
            };
            const result = await chatRoomsCollection.insertOne(newChatRoom);
            newChatRoom._id = result.insertedId; // Додаємо _id в об'єкт

            // Повідомити всіх учасників про новий чат
            allMemberIds.forEach((memberUsername) => {
              const memberWs = onlineUsers.get(memberUsername);
              if (memberWs && memberWs.readyState === WebSocket.OPEN) {
                memberWs.send(
                  JSON.stringify({ type: "newChatCreated", chat: newChatRoom })
                );
              }
            });

            allMemberIds.forEach((memberId) => {
              updateUserChatActivity(newChatRoom._id.toString(), memberId);
            });
            break;
          }

          case "editChat": {
            // Для редагування групи
            const { chatId, newName, newMemberUsernames } = data.payload;
            if (
              !currentUsername ||
              !chatId ||
              (!newName && !newMemberUsernames)
            ) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  message: "Missing data for chat edit.",
                })
              );
              return;
            }

            const chatToEdit = await chatRoomsCollection.findOne({
              _id: new ObjectId(chatId),
              type: "group",
            });
            if (!chatToEdit) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  message: "Group chat not found or not a group chat.",
                })
              );
              return;
            }
            // Перевірка, чи поточний користувач є учасником (або адміном, якщо є така роль)
            if (!chatToEdit.members.includes(currentUsername)) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  message: "Not authorized to edit this chat.",
                })
              );
              return;
            }

            const updatePayload = { $set: { lastActivity: new Date() } };
            if (newName) updatePayload.$set.name = newName;

            let allNewMembers = chatToEdit.members;
            if (newMemberUsernames) {
              // Поточний користувач завжди має бути в групі, яку він редагує
              const finalMembers = Array.from(
                new Set([currentUsername, ...newMemberUsernames])
              );
              if (finalMembers.length < 2 && type === "group") {
                // Група має мати хоча б 2 учасників
                ws.send(
                  JSON.stringify({
                    type: "error",
                    message: "Group chat must have at least two members.",
                  })
                );
                return;
              }
              updatePayload.$set.members = finalMembers;
              allNewMembers = finalMembers;
            }

            await chatRoomsCollection.updateOne(
              { _id: new ObjectId(chatId) },
              updatePayload
            );
            const updatedChat = await chatRoomsCollection.findOne({
              _id: new ObjectId(chatId),
            });

            // Повідомити всіх (старих та нових) учасників про зміни
            const membersToNotify = Array.from(
              new Set([...chatToEdit.members, ...allNewMembers])
            );
            membersToNotify.forEach((memberUsername) => {
              const memberWs = onlineUsers.get(memberUsername);
              if (memberWs && memberWs.readyState === WebSocket.OPEN) {
                memberWs.send(
                  JSON.stringify({ type: "chatUpdated", chat: updatedChat })
                );
              }
            });
            break;
          }

          case "sendMessage": {
            const { chatId, contentText } = data.payload;
            if (!currentUsername || !chatId || !contentText) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  message: "Missing data for sending message.",
                })
              );
              return;
            }

            const chatRoom = await chatRoomsCollection.findOne({
              _id: new ObjectId(chatId),
            });
            if (!chatRoom || !chatRoom.members.includes(currentUsername)) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  message: "Chat not found or you are not a member.",
                })
              );
              return;
            }

            const newMessage = {
              chatId: new ObjectId(chatId),
              senderUsername: currentUsername,
              content: contentText,
              timestamp: new Date(),
            };
            const insertResult = await messagesCollection.insertOne(newMessage);
            newMessage._id = insertResult.insertedId;

            await chatRoomsCollection.updateOne(
              { _id: new ObjectId(chatId) },
              { $set: { lastActivity: new Date() } }
            );

            // Відправник повідомлення автоматично "бачить" всі повідомлення в цьому чаті
            await updateUserChatActivity(chatId, currentUsername);

            // Надіслати повідомлення всім учасникам чату
            chatRoom.members.forEach((memberUsername) => {
              const memberWs = onlineUsers.get(memberUsername);
              if (memberWs && memberWs.readyState === WebSocket.OPEN) {
                memberWs.send(
                  JSON.stringify({
                    type: "newMessage",
                    message: newMessage,
                    chatId: chatId,
                  })
                );
              }
            });
            break;
          }

          case "fetchMessages": {
            const { chatId } = data.payload;
            if (!currentUsername || !chatId) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  message: "Missing chatId for fetching messages.",
                })
              );
              return;
            }
            const messages = await messagesCollection
              .find({ chatId: new ObjectId(chatId) })
              .sort({ timestamp: 1 }) // Від старих до нових
              .limit(100) // Обмеження для початку
              .toArray();
            ws.send(
              JSON.stringify({
                type: "messagesHistory",
                chatId: chatId,
                messages: messages,
              })
            );
            // Коли користувач завантажує історію, він "бачить" цей чат
            await updateUserChatActivity(chatId, currentUsername);
            break;
          }
          case "markChatAsRead": {
            const { chatId } = data.payload;
            if (!currentUsername || !chatId) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  message: "Missing data for markChatAsRead.",
                })
              );
              return;
            }
            await updateUserChatActivity(chatId, currentUsername);
            // Можна надіслати підтвердження, але не обов'язково
            // ws.send(JSON.stringify({ type: 'chatMarkedAsRead', chatId: chatId }));
            console.log(
              `SERVER: User ${currentUsername} marked chat ${chatId} as read.`
            );
            break;
          }
        }
      } catch (error) {
        console.error(
          `Error processing message for ${currentUsername}:`,
          error
        );
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Server processing error.",
              details: error.message,
            })
          );
        }
      }
    });

    ws.on("close", () => {
      if (currentUsername) {
        onlineUsers.delete(currentUsername);
        console.log(
          `User disconnected: ${currentUsername}. Total online: ${onlineUsers.size}`
        );
        // Можна додати сповіщення іншим про оффлайн статус, якщо потрібно
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error for user", currentUsername, ":", error);
      if (currentUsername) {
        onlineUsers.delete(currentUsername);
      }
    });
  });

  const PORT = process.env.PORT || 3001; // Порт для Node.js сервера
  server.listen(PORT, () => {
    console.log(`Node.js CHAT Server running on http://localhost:${PORT}`);
    console.log(
      `Node.js CHAT WebSocket server running on ws://localhost:${PORT}`
    );
  });
}

main().catch(console.error);
