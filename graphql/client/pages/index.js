import MsgList from '../components/MsgList';
import { fetcher } from '../queryClient';
import { GET_MESSAGES } from '../graphql/message';
import { GET_USERS } from '../graphql/user';

const Home = ({ serverMsgs, users }) => {
  return (
    <>
      <h1>SIMPLE SNS</h1>
      <MsgList serverMsgs={serverMsgs} users={users} />
    </>
  );
};

export const getServerSideProps = async () => {
  const [{ messages: serverMsgs }, { users }] = await Promise.all([
    fetcher(GET_MESSAGES),
    fetcher(GET_USERS),
  ]);

  console.log({ serverMsgs, users });

  return {
    props: { serverMsgs, users },
  };
};

export default Home;
