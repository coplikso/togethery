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
  const [mode, setMode] = useState('youtube');
  const [pdfData, setPdfData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const canvasRef = useRef(null);
  const pdfDocRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target.result;
      setPdfData(data);
      socket.emit('load_pdf', { roomCode, pdfData: data });
    };
    reader.readAsDataURL(file);
  };

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

    socket.on('load_pdf', ({ pdfData }) => {
      setPdfData(pdfData);
      setCurrentPage(1);
    });

    socket.on('sync_page', ({ page }) => {
      setCurrentPage(page);
      renderPage(page);
    });

    socket.on('chat_message', ({ username, text, timestamp }) => {
      setMessages((prev) => [...prev, { username, text, timestamp }]);
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
      socket.off('load_pdf');
      socket.off('sync_page');
      socket.off('chat_message');
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
    if (!pdfData || !canvasRef.current) return;

    const loadPdf = async () => {
      const pdfjsLib = window.pdfjsLib;
      const pdf = await pdfjsLib.getDocument(pdfData).promise;
      pdfDocRef.current = pdf;
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      renderPage(1, pdf);
    };

    loadPdf();
  }, [pdfData]);

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

  const renderPage = async (pageNum, pdf) => {
    const pdfDoc = pdf || pdfDocRef.current;
    if (!pdfDoc || !canvasRef.current) return;

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const task = page.render({ canvasContext: context, viewport });
    renderTaskRef.current = task;

    try {
      await task.promise;
    } catch (err) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('PDF render error:', err);
      }
    } finally {
      if (renderTaskRef.current === task) {
        renderTaskRef.current = null;
      }
    }
  };

  const goToPage = (newPage) => {
    if (!pdfDocRef.current) return;
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    renderPage(newPage);
    socket.emit('sync_page', { roomCode: roomCodeRef.current, page: newPage });
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const msg = {
      username,
      text: chatInput,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, msg]);
    socket.emit('chat_message', { roomCode: roomCodeRef.current, ...msg });
    setChatInput('');
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

        {/* Mode switcher */}
        <div>
          <button onClick={() => setMode('youtube')}>YouTube</button>
          <button onClick={() => setMode('pdf')}>PDF</button>
        </div>

        {/* YouTube section */}
        <div style={{ display: mode === 'youtube' ? 'block' : 'none' }}>
          <input
            placeholder="paste youtube URL"
            value={videoUrlInput}
            onChange={(e) => setVideoUrlInput(e.target.value)}
          />
          <button onClick={loadVideo}>load video</button>
          <div ref={playerRef}></div>
        </div>

        {/* PDF section */}
        {mode === 'pdf' && (
          <>
            <input type="file" accept=".pdf" onChange={handlePdfUpload} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>← Prev</button>
              <span>page {currentPage} of {totalPages}</span>
              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}>Next →</button>
            </div>
            <canvas ref={canvasRef}></canvas>
          </>
        )}

        {/* Chat section */}
        <div style={{ marginTop: '2rem' }}>
          <h3>Chat</h3>
          <div style={{ height: '200px', overflowY: 'auto', border: '1px solid #444', padding: '0.5rem', marginBottom: '0.5rem' }}>
            {messages.map((msg, i) => (
              <div key={i}>
                <strong>{msg.username}</strong>: {msg.text}
                <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: '0.5rem' }}>{msg.timestamp}</span>
              </div>
            ))}
          </div>
          <input
            placeholder="Type a message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            style={{ width: '70%', marginRight: '0.5rem' }}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
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
