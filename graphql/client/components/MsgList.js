import MsgItem from './MsgItem';
import MsgInput from './MsgInput';
import { useEffect, useRef, useState } from 'react';
import { fetcher, QueryKeys } from '../queryClient';
import { useRouter } from 'next/router';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  GET_MESSAGES,
  CREATE_MESSAGE,
  UPDATE_MESSAGE,
  DELETE_MESSAGE,
} from '../graphql/message';

const MsgList = ({ serverMsgs, users }) => {
  const client = useQueryClient();
  const {
    query: { userId = '' },
  } = useRouter(); // http://localhost:3000/?userId=sean
  const [msgs, setMsgs] = useState(serverMsgs);
  const [editingId, setEditingId] = useState(null);
  /*const fetchMoreEl = useRef(null);
  const intersecting = useInfiniteScroll(fetchMoreEl);
  const [hasNext, setHasNext] = useState(true);*/

  const { mutate: onCreate } = useMutation(
    ({ text }) => fetcher(CREATE_MESSAGE, { text, userId }),
    {
      onSuccess: ({ createMessage }) => {
        client.setQueryData(QueryKeys.MESSAGES, (old) => {
          return {
            messages: [createMessage, ...old.messages],
          };
        });
      },
    },
  );

  /*const onCreate = async (text) => {
    const newMsg = await fetcher('post', '/messages', { userId, text });
    if (!newMsg) throw new Error('something wrong');
    setMsgs((msgs) => [newMsg, ...msgs]);
  };*/

  const { mutate: onUpdate } = useMutation(
    ({ text, id }) => fetcher(UPDATE_MESSAGE, { text, id, userId }),
    {
      onSuccess: ({ updateMessage }) => {
        client.setQueryData(QueryKeys.MESSAGES, (old) => {
          const targetIdx = old.messages.findIndex(
            (msg) => msg.id === updateMessage.id,
          );
          if (targetIdx < 0) return old;
          const newMsgs = [...old.messages];
          newMsgs.splice(targetIdx, 1, updateMessage);
          return { messages: newMsgs };
        });
        doneEdit();
      },
    },
  );

  /*const onUpdate = async (text, id) => {
    const newMsg = await fetcher('put', `/messages/${id}`, { userId, text });
    if (!newMsg) throw new Error('something wrong');
    setMsgs((msgs) => {
      const targetIdx = msgs.findIndex((msg) => msg.id === id);
      if (targetIdx < 0) return msgs;
      const newMsgs = [...msgs];
      newMsgs.splice(targetIdx, 1, newMsg);
      return newMsgs;
    });
    doneEdit();
  };*/

  const doneEdit = () => {
    setEditingId(null);
  };

  const { mutate: onDelete } = useMutation(
    (id) => fetcher(DELETE_MESSAGE, { id, userId }),
    {
      onSuccess: ({ deleteMessage: deletedId }) => {
        client.setQueryData(QueryKeys.MESSAGES, (old) => {
          const targetIdx = old.messages.findIndex(
            (msg) => msg.id === deletedId,
          );
          if (targetIdx < 0) return old;
          const newMsgs = [...old.messages];
          newMsgs.splice(targetIdx, 1);
          return { messages: newMsgs };
        });
      },
    },
  );

  /*const onDelete = async (id) => {
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
  };*/

  const { data, error, isError } = useQuery(QueryKeys.MESSAGES, () =>
    fetcher(GET_MESSAGES),
  );

  console.log(data);

  useEffect(() => {
    if (!data?.messages) return;
    console.log('msgs changed!');
    setMsgs(data.messages);
  }, [data?.messages]);

  if (isError) {
    console.error(error);
    return null;
  }

  /*const getMsgs = async () => {
    const newMsgs = await fetcher('get', '/messages', {
      params: { cursor: msgs[msgs.length - 1]?.id || '' },
    });
    if (newMsgs.length === 0) {
      setHasNext(false);
      return;
    }
    setMsgs((msgs) => [...msgs, ...newMsgs]);
  };*/

  /*useEffect(() => {
    if (intersecting && hasNext) getMsgs();
  }, [intersecting]);*/

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
            user={users.find((user) => userId === user.id)}
          />
        ))}
      </ul>
      {/*<div ref={fetchMoreEl}></div>*/}
    </>
  );
};

export default MsgList;
