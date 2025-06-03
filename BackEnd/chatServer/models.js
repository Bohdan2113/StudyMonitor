// Це не Mongoose, а просто опис структур для ясності

/*
ChatRoom Schema:
{
    _id: ObjectId, // Генерується MongoDB, це наш chatId
    name: String, // Для групових чатів
    type: String, // 'direct' or 'group'
    members: [String], // Масив username учасників
    createdBy: String, // username того, хто створив чат
    createdAt: Date,
    lastActivity: Date
}

Message Schema:
{
    _id: ObjectId, // Генерується MongoDB
    chatId: ObjectId, // Посилання на _id ChatRoom
    senderUsername: String,
    content: String,
    timestamp: Date
}
*/