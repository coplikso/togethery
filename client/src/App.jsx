import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

const styles = {
  root: {
    minHeight: '100vh',
    backgroundColor: '#0E0E10',
    color: '#F0F0F5',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  landing: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '2rem',
  },
  landingLogo: {
    fontSize: '2rem',
    fontWeight: '700',
    letterSpacing: '-0.04em',
    color: '#F0F0F5',
  },
  landingAccent: { color: '#7C6FFF' },
  landingCard: {
    backgroundColor: '#1A1A1F',
    border: '1px solid #474E93',
    borderRadius: '16px',
    padding: '2rem',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    backgroundColor: '#0E0E10',
    border: '1px solid #474E93',
    borderRadius: '8px',
    padding: '0.6rem 0.9rem',
    color: '#F0F0F5',
    fontSize: '0.9rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  divider: { borderColor: '#474E93', margin: '0.25rem 0' },
  btnPrimary: {
    backgroundColor: '#7C6FFF',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.65rem 1.2rem',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    width: '100%',
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    color: '#F0F0F5',
    border: '1px solid #474E93',
    borderRadius: '8px',
    padding: '0.65rem 1.2rem',
    fontWeight: '500',
    fontSize: '0.9rem',
    cursor: 'pointer',
    width: '100%',
  },
  error: { color: '#FF6B6B', fontSize: '0.8rem' },

  roomWrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.9rem 1.5rem',
    borderBottom: '1px solid #474E93',
    flexShrink: 0,
  },
  bodyRow: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  mainArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '1.25rem',
    gap: '1rem',
    overflowY: 'auto',
  },
  sidebar: {
    width: '300px',
    minWidth: '300px',
    backgroundColor: '#1A1A1F',
    borderLeft: '1px solid #474E93',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  logo: {
    fontSize: '1.2rem',
    fontWeight: '700',
    letterSpacing: '-0.03em',
  },
  roomPill: {
    backgroundColor: '#1A1A1F',
    border: '1px solid #474E93',
    borderRadius: '999px',
    padding: '0.3rem 0.9rem',
    fontSize: '0.8rem',
    color: '#7C6FFF',
    fontWeight: '600',
    cursor: 'pointer',
    letterSpacing: '0.05em',
  },
  modeTabs: {
    display: 'flex',
    gap: '0.5rem',
  },
  tabBtn: (active) => ({
    backgroundColor: active ? '#7C6FFF' : 'transparent',
    color: active ? '#fff' : '#6B6B7A',
    border: `1px solid ${active ? '#7C6FFF' : '#474E93'}`,
    borderRadius: '8px',
    padding: '0.4rem 1rem',
    fontWeight: '500',
    fontSize: '0.85rem',
    cursor: 'pointer',
  }),

  // YouTube
  videoContainer: {
    backgroundColor: '#1A1A1F',
    border: '1px solid #474E93',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  videoInputRow: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.75rem',
    borderBottom: '1px solid #474E93',
  },
  videoInputField: {
    backgroundColor: '#0E0E10',
    border: '1px solid #474E93',
    borderRadius: '8px',
    padding: '0.5rem 0.8rem',
    color: '#F0F0F5',
    fontSize: '0.85rem',
    outline: 'none',
    flex: 1,
  },
  loadBtn: {
    backgroundColor: '#7C6FFF',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.5rem 1rem',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  // 16:9 responsive wrapper for YouTube iframe
  playerWrapper: {
    position: 'relative',
    width: '100%',
    paddingTop: '56.25%',
  },

  // PDF
  pdfContainer: {
    backgroundColor: '#1A1A1F',
    border: '1px solid #474E93',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  pdfToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    borderBottom: '1px solid #474E93',
    flexShrink: 0,
  },
  pdfUploadLabel: {
    backgroundColor: '#0E0E10',
    border: '1px solid #474E93',
    borderRadius: '8px',
    padding: '0.4rem 0.8rem',
    fontSize: '0.8rem',
    color: '#6B6B7A',
    cursor: 'pointer',
  },
  pageInfo: {
    fontSize: '0.8rem',
    color: '#6B6B7A',
    marginLeft: 'auto',
  },
  navBtn: (disabled) => ({
    backgroundColor: 'transparent',
    border: '1px solid #474E93',
    borderRadius: '6px',
    padding: '0.3rem 0.6rem',
    color: disabled ? '#3A3A45' : '#F0F0F5',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '0.85rem',
  }),
  // Canvas wrapper — scrollable, never stretches the canvas
  canvasWrapper: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '1rem',
  },

  // Sidebar
  sidebarSection: {
    padding: '1rem',
    borderBottom: '1px solid #474E93',
  },
  sidebarLabel: {
    fontSize: '0.7rem',
    fontWeight: '600',
    letterSpacing: '0.08em',
    color: '#6B6B7A',
    textTransform: 'uppercase',
    marginBottom: '0.6rem',
  },
  participantList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  participantItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
  },
  participantDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#4ADE80',
    flexShrink: 0,
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  chatLabel: {
    fontSize: '0.7rem',
    fontWeight: '600',
    letterSpacing: '0.08em',
    color: '#6B6B7A',
    textTransform: 'uppercase',
    padding: '1rem 1rem 0.5rem',
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    padding: '0 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  chatMsg: { fontSize: '0.82rem', lineHeight: '1.5' },
  chatUsername: { fontWeight: '600', color: '#7C6FFF', marginRight: '0.4rem' },
  chatTimestamp: { fontSize: '0.7rem', color: '#3A3A45', marginLeft: '0.3rem' },
  chatInputRow: {
    display: 'flex',
    gap: '0.6rem',
    padding: '0.5rem',
    borderTop: '1px solid #474E93',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#0E0E10',
    border: '1px solid #474E93',
    borderRadius: '8px',
    padding: '0.5rem 0.75rem',
    color: '#F0F0F5',
    fontSize: '0.82rem',
    outline: 'none',
  },
  chatSendBtn: {
    backgroundColor: '#0E0E10',
    border: '1px solid #474E93',
    color: '#fff',
    borderRadius: '8px',
    padding: '0.5rem 0.75rem',
    fontWeight: '600',
    fontSize: '0.82rem',
    cursor: 'pointer',
  },
};

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
  const [videoId, setVideoId] = useState('');
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
  const chatBottomRef = useRef(null);
  const [copied, setCopied] = useState(false);

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

  useEffect(() => { roomCodeRef.current = roomCode; }, [roomCode]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onPlayerStateChange = (event) => {
    if (ignoreStateChange.current) { ignoreStateChange.current = false; return; }
    const currentTime = playerInstance.current.getCurrentTime();
    if (event.data === window.YT.PlayerState.PLAYING) {
      socket.emit('video_action', { roomCode: roomCodeRef.current, action: 'play', currentTime });
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      socket.emit('video_action', { roomCode: roomCodeRef.current, action: 'pause', currentTime });
    }
  };

  useEffect(() => {
    socket.on('room_created', (data) => { setRoomCode(data.roomCode); setUsers(data.users); });
    socket.on('room_update', (updatedUsers) => setUsers(updatedUsers));
    socket.on('join_error', (msg) => setError(msg));
    socket.on('load_video', ({ videoId }) => {
      setVideoId(videoId);
      if (playerInstance.current) playerInstance.current.loadVideoById(videoId);
    });
    socket.on('load_pdf', ({ pdfData }) => { setPdfData(pdfData); setCurrentPage(1); });
    socket.on('sync_page', ({ page }) => { setCurrentPage(page); renderPage(page); });
    socket.on('chat_message', ({ username, text, timestamp }) => {
      setMessages((prev) => [...prev, { username, text, timestamp }]);
    });
    socket.on('video_action', ({ action, currentTime }) => {
      if (!playerInstance.current) return;
      const player = playerInstance.current;
      if (action === 'seek') { ignoreStateChange.current = true; player.seekTo(currentTime, true); return; }
      const localTime = player.getCurrentTime();
      if (Math.abs(localTime - currentTime) > 1) { ignoreStateChange.current = true; player.seekTo(currentTime, true); }
      setTimeout(() => {
        ignoreStateChange.current = true;
        if (action === 'play') player.playVideo();
        else if (action === 'pause') player.pauseVideo();
      }, 100);
    });
    socket.on('room_state', ({ videoId, currentTime, isPlaying }) => {
      pendingRoomState.current = { videoId, currentTime, isPlaying };
      setVideoId(videoId);
    });
    return () => {
      socket.off('room_created'); socket.off('room_update'); socket.off('join_error');
      socket.off('load_video'); socket.off('video_action'); socket.off('room_state');
      socket.off('load_pdf'); socket.off('sync_page'); socket.off('chat_message');
    };
  }, []);

  useEffect(() => {
    if (!roomCode) return;
    window.onYouTubeIframeAPIReady = () => {
      playerInstance.current = new window.YT.Player(playerRef.current, {
        height: '100%',
        width: '100%',
        videoId,
        events: {
          onStateChange: onPlayerStateChange,
          onReady: (event) => {
            const state = pendingRoomState.current;
            if (state) {
              event.target.loadVideoById(state.videoId);
              setTimeout(() => {
                event.target.seekTo(state.currentTime, true);
                if (!state.isPlaying) event.target.pauseVideo();
                pendingRoomState.current = null;
              }, 1000);
            }
          }
        },
      });
    };
    if (window.YT && window.YT.Player) window.onYouTubeIframeAPIReady();
  }, [roomCode]);

  useEffect(() => {
    if (!pdfData || !canvasRef.current) return;
    const loadPdf = async () => {
      const pdf = await window.pdfjsLib.getDocument(pdfData).promise;
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
      if (!playerInstance.current?.getCurrentTime) return;
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

  const renderPage = async (pageNum, pdf) => {
    const pdfDoc = pdf || pdfDocRef.current;
    if (!pdfDoc || !canvasRef.current) return;
    if (renderTaskRef.current) { renderTaskRef.current.cancel(); renderTaskRef.current = null; }
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
      if (err?.name !== 'RenderingCancelledException') console.error('PDF render error:', err);
    } finally {
      if (renderTaskRef.current === task) renderTaskRef.current = null;
    }
  };

  const goToPage = (newPage) => {
    if (!pdfDocRef.current || newPage < 1 || newPage > totalPages) return;
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

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const createRoom = () => { if (username) socket.emit('create_room', username); };
  const joinRoom = () => {
    if (!username || !roomCodeInput) return;
    setError('');
    socket.emit('join_room', { roomCode: roomCodeInput, username });
    setRoomCode(roomCodeInput);
  };
  const loadVideo = () => {
    const id = extractVideoId(videoUrlInput);
    if (!id) { alert('Invalid YouTube URL'); return; }
    setVideoId(id);
    if (playerInstance.current) playerInstance.current.loadVideoById(id);
    socket.emit('load_video', { roomCode, videoId: id });
  };

  // ─── Landing ──────────────────────────────────────────────
  if (!roomCode) {
    return (
      <div style={styles.root}>
        <div style={styles.landing}>
          <div style={styles.landingLogo}>
            together<span style={styles.landingAccent}>ly</span>
          </div>
          <div style={styles.landingCard}>
            <input
              style={styles.input}
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button style={styles.btnPrimary} onClick={createRoom}>Create Room</button>
            <hr style={styles.divider} />
            <input
              style={styles.input}
              placeholder="Room code"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
            />
            <button style={styles.btnSecondary} onClick={joinRoom}>Join Room</button>
            {error && <p style={styles.error}>{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  // ─── Room ─────────────────────────────────────────────────
  return (
    <div style={{ ...styles.root, ...styles.roomWrapper }}>

      {/* Topbar */}
      <div style={styles.topbar}>
        <span style={styles.logo}>
          together<span style={{ color: '#7C6FFF' }}>ly</span>
        </span>
        <span
          style={{ ...styles.roomPill, boxShadow: copied ? '0 0 0 2px #7C6FFF55' : 'none' }}
          onClick={copyRoomCode}
          title="Click to copy"
        >
          {copied ? 'Copied!' : `# ${roomCode}`}
        </span>
      </div>

      {/* Body */}
      <div style={styles.bodyRow}>

        {/* Main */}
        <div style={styles.mainArea}>
          <div style={styles.modeTabs}>
            <button style={styles.tabBtn(mode === 'youtube')} onClick={() => setMode('youtube')}>YouTube</button>
            <button style={styles.tabBtn(mode === 'pdf')} onClick={() => setMode('pdf')}>PDF</button>
          </div>

          {/* YouTube */}
          {mode === 'youtube' && (
            <div style={styles.videoContainer}>
              <div style={styles.videoInputRow}>
                <input
                  style={styles.videoInputField}
                  placeholder="Paste YouTube URL..."
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadVideo()}
                />
                <button style={styles.loadBtn} onClick={loadVideo}>Load</button>
              </div>
              <div style={styles.playerWrapper}>
                <div
                  ref={playerRef}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                ></div>
              </div>
            </div>
          )}

          {/* PDF */}
          {mode === 'pdf' && (
            <div style={styles.pdfContainer}>
              <div style={styles.pdfToolbar}>
                <label style={styles.pdfUploadLabel}>
                  + Upload PDF
                  <input type="file" accept=".pdf" onChange={handlePdfUpload} style={{ display: 'none' }} />
                </label>
                {pdfData && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                    <button style={styles.navBtn(currentPage <= 1)} onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>←</button>
                    <span style={styles.pageInfo}>{currentPage} / {totalPages}</span>
                    <button style={styles.navBtn(currentPage >= totalPages)} onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}>→</button>
                  </div>
                )}
            </div>
              <div style={styles.canvasWrapper}>
                {pdfData
                  ? <canvas ref={canvasRef} style={{ display: 'block' }}></canvas>
                  : <p style={{ color: '#3A3A45', fontSize: '0.85rem' }}>Upload a PDF or wait for someone to load one.</p>
                }
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarSection}>
            <div style={styles.sidebarLabel}>In this room</div>
            <div style={styles.participantList}>
              {users.map((u, i) => (
                <div key={i} style={styles.participantItem}>
                  <span style={styles.participantDot}></span>
                  <span>{u.username}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.chatArea}>
            <div style={styles.chatLabel}>Chat</div>
            <div style={styles.chatMessages}>
              {messages.length === 0 && (
                <p style={{ color: '#3A3A45', fontSize: '0.8rem' }}>No messages yet.</p>
              )}
              {messages.map((msg, i) => (
                <div key={i} style={styles.chatMsg}>
                  <span style={styles.chatUsername}>{msg.username}</span>
                  <span>{msg.text}</span>
                  <span style={styles.chatTimestamp}>{msg.timestamp}</span>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>
            <div style={styles.chatInputRow}>
              <input
                style={styles.chatInput}
                placeholder="Message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button style={styles.chatSendBtn} onClick={sendMessage}>↑</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
