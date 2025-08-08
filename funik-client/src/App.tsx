import { useEffect, useState } from 'react';
import { socket } from './socket';

function App() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<string[]>([]);

  const sendMessage = () => {
    if (message.trim() !== '') {
      socket.emit('send_message', message);
      setChat(prev => [...prev, `You: ${message}`]);
      setMessage('');
    }
  };

  useEffect(() => {
    socket.on('receive_message', (msg: string) => {
      setChat(prev => [...prev, `Other: ${msg}`]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Chat App</h2>
      <div style={{ marginBottom: '1rem', minHeight: 100 }}>
        {chat.map((msg, index) => <div key={index}>{msg}</div>)}
      </div>
      <input
        type="text"
        placeholder="Type your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
