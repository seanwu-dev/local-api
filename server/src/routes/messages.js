import { readDB, writeDB } from '../dbController.js';
import { v4 } from 'uuid';

const getMsgs = () => readDB('messages');
const setMsgs = (data) => writeDB('messages', data);

const messageRoute = [
  {
    // GET MESSAGES
    method: 'get',
    route: '/messages',
    handler: (req, res) => {
      const msgs = getMsgs();
      res.send(msgs);
    },
  },
  {
    // GET MESSAGE
    method: 'get',
    route: '/messages/:id',
    handler: ({ params: { id } }, res) => {
      try {
        const msgs = getMsgs();
        const msg = msgs.find((msg) => msg.id === id);
        if (!msg) throw new Error('not found');
        res.send(msg);
      } catch (err) {
        res.status(404).send({ error: err });
      }
    },
  },
  {
    // CREATE MESSAGE
    method: 'post',
    route: '/messages',
    handler: ({ body }, res) => {
      const msgs = getMsgs();
      const newMsg = {
        id: v4(),
        userId: body.userId,
        timestamp: Date.now(),
        text: body.text,
      };
      msgs.unshift(newMsg);
      const response = setMsgs(msgs);
      res.send(response);
    },
  },
  {
    // UPDATE MESSAGE
    method: 'put',
    route: '/messages/:id',
    handler: ({ body, params: { id } }, res) => {
      try {
        const msgs = getMsgs();
        const targetIdx = msgs.findIndex((msg) => msg.id === id);
        if (targetIdx < 0) throw '메시지가 없습니다.';
        if (msgs[targetIdx].userId !== body.userId) throw '사용자가 다릅니다.';
        const newMsg = { ...msgs[targetIdx], text: body.text };
        msgs.splice(targetIdx, 1, newMsg);
        const response = setMsgs(msgs);
        res.send(response);
      } catch (err) {
        res.status(500).send({ error: err });
      }
    },
  },
  {
    // DELETE MESSAGE
    method: 'delete',
    route: '/messages/:id',
    handler: ({ body, params: { id } }, res) => {
      try {
        const msgs = getMsgs();
        const targetIdx = msgs.findIndex((msg) => msg.id === id);
        if (targetIdx < 0) throw '메시지가 없습니다.';
        if (msgs[targetIdx].userId !== body.userId) throw '사용자가 다릅니다.';
        msgs.splice(targetIdx, 1);
        const response = setMsgs(msgs);
        res.send(response);
      } catch (err) {
        res.status(500).send({ error: err });
      }
    },
  },
];

export default messageRoute;
