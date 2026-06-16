import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

function extractVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function App() {
  const [username, setUsername] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [roomCode, setRoomCode] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [videoId, setVideoId] = useState('dQw4w9WgXcQ');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const playerRef = useRef(null);
  const playerInstance = useRef(null);
  const ignoreStateChange = useRef(false);
  const roomCodeRef = useRef(null);
  const lastTimeRef = useRef(0);
  const pendingRoomState = useRef(null);

  useEffect(() => {
    roomCodeRef.current = roomCode;
  }, [roomCode]);

  const onPlayerStateChange = (event) => {
    if (ignoreStateChange.current) {
      ignoreStateChange.current = false;
      return;
    }

    const currentTime = playerInstance.current.getCurrentTime();

    if (event.data === window.YT.PlayerState.PLAYING) {
      socket.emit('video_action', { roomCode: roomCodeRef.current, action: 'play', currentTime });
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      socket.emit('video_action', { roomCode: roomCodeRef.current, action: 'pause', currentTime });
    }
  };

  useEffect(() => {
    socket.on('room_created', (data) => {
      setRoomCode(data.roomCode);
      setUsers(data.users);
    });

    socket.on('room_update', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    socket.on('join_error', (msg) => {
      setError(msg);
    });

    socket.on('load_video', ({ videoId }) => {
      setVideoId(videoId);
      if (playerInstance.current) {
        playerInstance.current.loadVideoById(videoId);
      }
    });

    socket.on('video_action', ({ action, currentTime }) => {
      if (!playerInstance.current) return;

      const player = playerInstance.current;

      if (action === 'seek') {
        ignoreStateChange.current = true;
        player.seekTo(currentTime, true);
        return;
      }

      const localTime = player.getCurrentTime();

      if (Math.abs(localTime - currentTime) > 1) {
        ignoreStateChange.current = true;
        player.seekTo(currentTime, true);
      }

      setTimeout(() => {
        ignoreStateChange.current = true;
        if (action === 'play') {
          player.playVideo();
        } else if (action === 'pause') {
          player.pauseVideo();
        }
      }, 100);
    });

    socket.on('room_state', ({ videoId, currentTime, isPlaying }) => {
      pendingRoomState.current = { videoId, currentTime, isPlaying };
      setVideoId(videoId);
    });

    return () => {
      socket.off('room_created');
      socket.off('room_update');
      socket.off('join_error');
      socket.off('load_video');
      socket.off('video_action');
      socket.off('room_state');
    };
  }, []);

  useEffect(() => {
    if (!roomCode) return;

    window.onYouTubeIframeAPIReady = () => {
      playerInstance.current = new window.YT.Player(playerRef.current, {
        height: '360',
        width: '640',
        videoId: videoId,
        events: {
          onStateChange: onPlayerStateChange,
          onReady: (event) => {
            const state = pendingRoomState.current;
            if (state) {
              event.target.loadVideoById(state.videoId);
              setTimeout(() => {
                event.target.seekTo(state.currentTime, true);
                if (!state.isPlaying) {
                  event.target.pauseVideo();
                }
                pendingRoomState.current = null;
              }, 1000);
            }
          }
        },
      });
    };

    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady();
    }
  }, [roomCode]);

  useEffect(() => {
    if (!roomCode) return;

    const interval = setInterval(() => {
      if (!playerInstance.current || !playerInstance.current.getCurrentTime) return;

      const currentTime = playerInstance.current.getCurrentTime();
      const lastTime = lastTimeRef.current;

      if (Math.abs(currentTime - lastTime - 1) > 2) {
        ignoreStateChange.current = true;
        socket.emit('video_action', { roomCode: roomCodeRef.current, action: 'seek', currentTime });
      }

      lastTimeRef.current = currentTime;
      socket.emit('sync_time', { roomCode: roomCodeRef.current, currentTime });
    }, 1000);

    return () => clearInterval(interval);
  }, [roomCode]);

  const createRoom = () => {
    if (!username) return;
    socket.emit('create_room', username);
  };

  const joinRoom = () => {
    if (!username || !roomCodeInput) return;
    setError('');
    socket.emit('join_room', { roomCode: roomCodeInput, username });
    setRoomCode(roomCodeInput);
  };

  const loadVideo = () => {
    const id = extractVideoId(videoUrlInput);
    if (!id) {
      alert('Invalid YouTube URL');
      return;
    }
    setVideoId(id);
    if (playerInstance.current) {
      playerInstance.current.loadVideoById(id);
    }
    socket.emit('load_video', { roomCode, videoId: id });
  };

  if (roomCode) {
    return (
      <div style={{ padding: '2rem', color: 'white' }}>
        <h1>Togetherly</h1>
        <h2>Room Code: {roomCode}</h2>
        <h3>Participants:</h3>
        <ul>
          {users.map((u, i) => (
            <li key={i}>{u.username}</li>
          ))}
        </ul>
        <input
          placeholder="Paste YouTube URL"
          value={videoUrlInput}
          onChange={(e) => setVideoUrlInput(e.target.value)}
        />
        <button onClick={loadVideo}>Load Video</button>
        <div ref={playerRef}></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', color: 'white' }}>
      <h1>Togetherly</h1>
      <input
        placeholder="Your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br /><br />
      <button onClick={createRoom}>Create Room</button>
      <br /><br />
      <input
        placeholder="Room code"
        value={roomCodeInput}
        onChange={(e) => setRoomCodeInput(e.target.value)}
      />
      <button onClick={joinRoom}>Join Room</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default App;
