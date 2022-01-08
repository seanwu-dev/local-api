import { request } from 'graphql-request';

const URL = 'http://localhost:8000/graphql';

export const fetcher = (query, variables = {}) =>
  request(URL, query, variables);

export const QueryKeys = {
  MESSAGES: 'MESSAGES',
  MESSAGE: 'MESSAGE',
  USERS: 'USERS',
  USER: 'USER',
};

export const findTargetMsgIdx = (pages, id) => {
  let msgIdx = -1;
  const pageIdx = pages.findIndex(({ messages }) => {
    msgIdx = messages.findIndex((msg) => msg.id === id);
    if (msgIdx > -1) {
      return true;
    }
    return false;
  });
  return { pageIdx, msgIdx };
};

export const getNewMsgs = (old) => ({
  pageParams: old.pageParams,
  pages: old.pages.map(({ messages }) => ({ messages: [...messages] })),
});
