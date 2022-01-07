const MsgItem = ({ userId, timestamp, text }) => {
  return (
    <li className="messages__item">
      <h3>{userId}</h3>
      <sub>
        {new Date(timestamp).toLocaleString("ko-KR", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}
      </sub>
      {text}
    </li>
  );
};

export default MsgItem;
