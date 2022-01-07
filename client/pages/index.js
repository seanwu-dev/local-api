import MsgList from '../components/MsgList';
import fetcher from '../fetcher';

const Home = ({ serverMsgs, users }) => {
  return (
    <>
      <h1>SIMPLE SNS</h1>
      <MsgList serverMsgs={serverMsgs} users={users} />
    </>
  );
};

export const getServerSideProps = async () => {
  const serverMsgs = await fetcher('get', '/messages');
  const users = await fetcher('get', '/users');
  return {
    props: { serverMsgs, users },
  };
};

export default Home;
