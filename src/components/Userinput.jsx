import { useState } from 'react';

const Userinput = ({ loading, onSubmit }) => {
  const [userInput, setUserInput] = useState("");

  const send = () => {
    if (loading || userInput.trim() === "") return;
    onSubmit(userInput.trim());
    setUserInput("");
  };

  const handleKeyDown = (e) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="composer">
      <textarea
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write a message"
        rows={1}
        className="composer-input"
      />
      <button type="button" className="composer-send" onClick={send} disabled={loading || userInput.trim() === ""} aria-label="Send">
        <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M10 16V4M4.5 9.5 10 4l5.5 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  );
};

export default Userinput;
