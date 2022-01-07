import MsgItem from "./MsgItem";

const UserIds = ["sean", "moon"];
const getRandomId = () => UserIds[Math.round(Math.random())];

const msgs = Array(50)
  .fill(0)
  .map((_, i) => ({
    id: 50 - i,
    userId: getRandomId(),
    timestamp: 1234567890123 + i * 1000 * 60,
    text: `${50 - i} - mock test`,
  }));

const MsgList = () => {
  return (
    <ul className="messages">
      {msgs.map((msg) => (
        <MsgItem key={msg.id} {...msg} />
      ))}
    </ul>
  );
};

export default MsgList;
