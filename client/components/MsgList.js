import MsgItem from "./MsgItem";
import MsgInput from "./MsgInput";
import { useState } from "react";

const UserIds = ["sean", "moon"];
const getRandomId = () => UserIds[Math.round(Math.random())];

const originalMsgs = Array(50)
  .fill(0)
  .map((_, i) => ({
    id: 50 - i,
    userId: getRandomId(),
    timestamp: 1234567890123 + i * 1000 * 60,
    text: `${50 - i} - mock test`,
  }));

const MsgList = () => {
  const [msgs, setMsgs] = useState(originalMsgs);
  const onCreate = (text) => {
    const newMsg = {
      id: msgs.length + 1,
      userId: getRandomId(),
      timestamp: Date.now(),
      text,
    };
    setMsgs((msgs) => [newMsg, ...msgs]);
  };

  return (
    <>
      <MsgInput mutate={onCreate} />
      <ul className="messages">
        {msgs.map((msg) => (
          <MsgItem key={msg.id} {...msg} />
        ))}
      </ul>
    </>
  );
};

export default MsgList;
