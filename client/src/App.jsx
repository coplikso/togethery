import { useState } from "react";
import { useEffect } from "react";
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

function App() {
  const [username, setUsername] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [roomCode, setRoomCode] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');


  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server! ID:', socket.id);
    });
  }, []);

  return (
    <div>
      <h1>togetherly</h1>
    </div>
  );
}

export default App;