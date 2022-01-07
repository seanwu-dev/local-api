import { useRef } from "react";

const MsgInput = ({ mutate }) => {
  const textRef = useRef(null);

  const onSubmitForm = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const text = textRef.current.value;
    textRef.current.value = "";
    mutate(text);
  };

  return (
    <>
      <form className="messages__input" onSubmit={onSubmitForm}>
        <textarea ref={textRef} placeholder="내용을 입력하세요."></textarea>
        <button type="submit">완료</button>
      </form>
    </>
  );
};

export default MsgInput;
