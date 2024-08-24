import { Input, Button} from 'antd';
import { useState } from 'react';
const { TextArea } = Input;

const Userinput = ( { loading , onSubmit}) => {
  const [userInput, setUserInput] = useState("");
  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  }
  const handleClick = () => {
    onSubmit(userInput);
  }

  return <div>
    <TextArea value={userInput} onChange={handleUserInput} placeholder='채팅을 입력해주세요'/>
    <Button loading = {loading} onClick={handleClick}>전송</Button>
    </div>
}

export default Userinput;