import { Input, Button} from 'antd';
import { useState } from 'react';
const { TextArea } = Input;

const Userinput = ({ loading, onSubmit }) => {
  const [userInput, setUserInput] = useState("");
  const handleUserInput = (e) => {
    if (e.target.value.trim() === "") {
      setUserInput("");
    } else {
      setUserInput(e.target.value);
    }
  }
  const handleClick = () => {
    if (userInput.trim() === "") {
      alert("Please enter a message");
    } else {
      setUserInput("");
      onSubmit(userInput);
    }
  }

  const handleEnter = (e) => {
    if (e.nativeEvent.isComposing) {
      return;
    } else {
      if (e.key === 'Enter')  {
        handleClick();
      }
    }
    
  }


  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <TextArea 
        value={userInput} 
        onChange={handleUserInput} 
        placeholder='Type your message here...' 
        onKeyDown={handleEnter}
        style={{
          flex: 1,
          fontSize: '16px',
          borderRadius: '8px'
        }}
        rows={2}
      />
      <Button 
        style={{ 
          height: '60px',
          padding: '0 20px',
          fontSize: '16px',
          borderRadius: '8px',
          backgroundColor: '#4CAF50',
          borderColor: '#4CAF50'
        }} 
        type="primary"
        loading={loading} 
        onClick={handleClick}
      >
        Send
      </Button>
    </div>
  );
}

export default Userinput; 