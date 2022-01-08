import MsgItem from './MsgItem';
import MsgInput from './MsgInput';
import { useEffect, useRef, useState } from 'react';
import {
  fetcher,
  QueryKeys,
  findTargetMsgIdx,
  getNewMsgs,
} from '../queryClient';
import { useRouter } from 'next/router';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import {
  GET_MESSAGES,
  CREATE_MESSAGE,
  UPDATE_MESSAGE,
  DELETE_MESSAGE,
} from '../graphql/message';

const MsgList = ({ serverMsgs }) => {
  const client = useQueryClient();
  const {
    query: { userId = '' },
  } = useRouter(); // http://localhost:3000/?userId=sean
  const [msgs, setMsgs] = useState([{ messages: serverMsgs }]);
  const [editingId, setEditingId] = useState(null);
  const fetchMoreEl = useRef(null);
  const intersecting = useInfiniteScroll(fetchMoreEl);
  /*const [hasNext, setHasNext] = useState(true);*/

  const { mutate: onCreate } = useMutation(
    ({ text }) => fetcher(CREATE_MESSAGE, { text, userId }),
    {
      onSuccess: ({ createMessage }) => {
        // pages: [{ messages: [createMessage, 12] }, { messages: [12] }, { messages: [8] }]
        client.setQueryData(QueryKeys.MESSAGES, (old) => {
          return {
            pageParam: old.pageParam,
            pages: [
              { messages: [createMessage, ...old.pages[0].messages] },
              ...old.pages.slice(1),
            ],
            /*messages: [createMessage, ...old.messages],*/
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
        doneEdit();
        client.setQueryData(QueryKeys.MESSAGES, (old) => {
          // pages: [{ messages: [12] }, { messages: [1, 2, 3, ... ,**7**, 8, ... , 12] }, { messages: [8] }]
          const { pageIdx, msgIdx } = findTargetMsgIdx(
            old.pages,
            updateMessage.id,
          );
          if (pageIdx < 0 || msgIdx < 0) return old;
          const newMsgs = getNewMsgs(old);
          /*const newPages = [...old.pages];
          newPages[pageIdx] = { messages: [...newPages[pageIdx].messages] };*/
          newMsgs.pages[pageIdx].messages.splice(msgIdx, 1, updateMessage);
          return newMsgs;
        });
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
          const { pageIdx, msgIdx } = findTargetMsgIdx(old.pages, deletedId);
          if (pageIdx < 0 || msgIdx < 0) return old;
          const newMsgs = getNewMsgs(old);
          /*const newPages = [...old.pages];
          newPages[pageIdx] = { messages: [...newPages[pageIdx].messages] };*/
          newMsgs.pages[pageIdx].messages.splice(msgIdx, 1);
          return newMsgs;
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

  const { data, error, isError, fetchNextPage, hasNextPage } = useInfiniteQuery(
    QueryKeys.MESSAGES,
    ({ pageParam = '' }) => {
      return fetcher(GET_MESSAGES, { cursor: pageParam });
    },
    {
      getNextPageParam: ({ messages }) => {
        return messages[messages.length - 1]?.id;
      },
    },
  );

  useEffect(() => {
    if (!data?.pages) return;
    console.log('msgs changed!');
    /*const mergedMsgs = data.pages.flatMap((data) => data.messages);*/
    setMsgs(data.pages);
  }, [data?.pages]);

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

  useEffect(() => {
    if (intersecting && hasNextPage) {
      fetchNextPage();
    }
  }, [intersecting, hasNextPage]);

  console.log({ data });

  return (
    <>
      <MsgInput mutate={onCreate} />
      <ul className="messages">
        {msgs.map(({ messages }) =>
          messages.map((msg) => (
            <MsgItem
              key={msg.id}
              {...msg}
              onUpdate={onUpdate}
              isEditing={editingId === msg.id}
              startEdit={() => setEditingId(msg.id)}
              onDelete={() => onDelete(msg.id)}
              myId={userId}
              /*user={users.find((user) => userId === user.id)}*/
            />
          )),
        )}
      </ul>
      <div ref={fetchMoreEl}></div>
    </>
  );
};

export default MsgList;
