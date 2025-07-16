import { Input, Button} from 'antd';
import { useState } from 'react';
const { TextArea } = Input;

const Userinput = ({ loading, onSubmit, isMobile = false }) => {
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
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: isMobile ? '8px' : '10px',
      flexDirection: isMobile ? 'column' : 'row'
    }}>
      <TextArea 
        value={userInput} 
        onChange={handleUserInput} 
        placeholder='Type your message here...' 
        onKeyDown={handleEnter}
        style={{
          flex: 1,
          fontSize: isMobile ? '14px' : '16px',
          borderRadius: '8px',
          width: isMobile ? '100%' : 'auto'
        }}
        rows={isMobile ? 2 : 2}
      />
      <Button 
        style={{ 
          height: isMobile ? '44px' : '60px',
          padding: isMobile ? '0 16px' : '0 20px',
          fontSize: isMobile ? '14px' : '16px',
          borderRadius: '8px',
          backgroundColor: '#4CAF50',
          borderColor: '#4CAF50',
          width: isMobile ? '100%' : 'auto',
          minWidth: isMobile ? '100px' : 'auto'
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