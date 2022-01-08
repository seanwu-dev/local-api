import { writeDB } from '../dbController.js';
import { v4 } from 'uuid';

const setMsgs = (data) => writeDB('messages', data);

/**
 * obj: parent 객체, 거의 사용하지 않음
 * args: Query에 필요한 필드에 제공되는 파라미터
 * context: 로그인한 사용자, DB Access 등의 중요한 정보
 */

const messageResolver = {
  Query: {
    messages: (parent, { cursor = '' }, { db }) => {
      const fromIdx = db.messages.findIndex((msg) => msg.id === cursor) + 1;
      return db.messages?.slice(fromIdx, fromIdx + 12) || [];
    },
    message: (parent, { id = '' }, { db }) => {
      return db.messages.find((msg) => msg.id === id);
    },
  },
  Mutation: {
    createMessage: (parent, { text, userId }, { db }) => {
      const newMsg = {
        id: v4(),
        userId,
        timestamp: Date.now(),
        text,
      };
      db.messages.unshift(newMsg);
      setMsgs(db.messages);
      return newMsg;
    },
    updateMessage: (parent, { id, text, userId }, { db }) => {
      const targetIdx = db.messages.findIndex((msg) => msg.id === id);
      if (targetIdx < 0) throw '메시지가 없습니다.';
      if (db.messages[targetIdx].userId !== userId) throw '사용자가 다릅니다.';
      const newMsg = { ...db.messages[targetIdx], text };
      db.messages.splice(targetIdx, 1, newMsg);
      setMsgs(db.messages);
      return newMsg;
    },
    deleteMessage: (parent, { id, userId }, { db }) => {
      const targetIdx = db.messages.findIndex((msg) => msg.id === id);
      if (targetIdx < 0) throw '메시지가 없습니다.';
      if (db.messages[targetIdx].userId !== userId) throw '사용자가 다릅니다.';
      db.messages.splice(targetIdx, 1);
      setMsgs(db.messages);
      return id;
    },
  },
  Message: {
    user: (msg, args, { db }) => db.users[msg.userId],
  },
};

export default messageResolver;
