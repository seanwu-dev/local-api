import MsgItem from './MsgItem';
import MsgInput from './MsgInput';
import { useEffect, useRef, useState } from 'react';
import fetcher from '../fetcher';
import { useRouter } from 'next/router';
import useInfiniteScroll from '../hooks/useInfiniteScroll';

/*const UserIds = ['sean', 'moon'];
const getRandomId = () => UserIds[Math.round(Math.random())];*/

/*const originalMsgs = Array(50)
  .fill(0)
  .map((_, i) => ({
    id: 50 - i,
    userId: getRandomId(),
    timestamp: 1234567890123 + i * 1000 * 60,
    text: `${50 - i} - mock test`,
  }));

console.log(JSON.stringify(originalMsgs));*/

const MsgList = () => {
  const {
    query: { userId = '' },
  } = useRouter(); // http://localhost:3000/?userId=sean
  const [msgs, setMsgs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const fetchMoreEl = useRef(null);
  const intersecting = useInfiniteScroll(fetchMoreEl);
  const [hasNext, setHasNext] = useState(true);

  const onCreate = async (text) => {
    const newMsg = await fetcher('post', '/messages', { userId, text });
    if (!newMsg) throw new Error('something wrong');
    /*const newMsg = {
      id: msgs.length + 1,
      userId: getRandomId(),
      timestamp: Date.now(),
      text,
    };*/
    setMsgs((msgs) => [newMsg, ...msgs]);
  };

  const onUpdate = async (text, id) => {
    const newMsg = await fetcher('put', `/messages/${id}`, { userId, text });
    if (!newMsg) throw new Error('something wrong');
    setMsgs((msgs) => {
      const targetIdx = msgs.findIndex((msg) => msg.id === id);
      if (targetIdx < 0) return msgs;
      const newMsgs = [...msgs];
      /*newMsgs.splice(targetIdx, 1, {
        ...msgs[targetIdx],
        text,
      });*/
      newMsgs.splice(targetIdx, 1, newMsg);
      return newMsgs;
    });
    doneEdit();
  };

  const doneEdit = () => {
    setEditingId(null);
  };

  const onDelete = async (id) => {
    const receivedId = await fetcher('delete', `/messages/${id}`, {
      params: { userId },
    });
    setMsgs((msgs) => {
      const targetIdx = msgs.findIndex((msg) => msg.id === receivedId + '');
      if (targetIdx < 0) return msgs;
      const newMsgs = [...msgs];
      newMsgs.splice(targetIdx, 1);
      return newMsgs;
    });
  };

  const getMsgs = async () => {
    const newMsgs = await fetcher('get', '/messages', {
      params: { cursor: msgs[msgs.length - 1]?.id || '' },
    });
    if (newMsgs.length === 0) {
      setHasNext(false);
      return;
    }
    setMsgs((msgs) => [...msgs, ...newMsgs]);
  };

  useEffect(() => {
    if (intersecting && hasNext) getMsgs();
  }, [intersecting]);

  return (
    <>
      <MsgInput mutate={onCreate} />
      <ul className="messages">
        {msgs.map((msg) => (
          <MsgItem
            key={msg.id}
            {...msg}
            onUpdate={onUpdate}
            isEditing={editingId === msg.id}
            startEdit={() => setEditingId(msg.id)}
            onDelete={() => onDelete(msg.id)}
            myId={userId}
          />
        ))}
      </ul>
      <div ref={fetchMoreEl}></div>
    </>
  );
};

export default MsgList;
