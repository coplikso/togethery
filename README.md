# togethery

> Watch together. Chat together. Stay together.

**togethery** is a real-time collaborative platform that lets you create a shared "room," invite friends, and enjoy synced YouTube videos or PDF documents — all while chatting live. It leans heavily on WebSocket-based real-time communication rather than traditional database polling, keeping everything instant and in sync.

🔗 **Live Demo:** [togethery.vercel.app](https://togethery.vercel.app)

---

## Features

- **Room-based sessions** — Create a room and share a link with friends to join instantly
- **Synced YouTube playback** — Watch YouTube videos in perfect sync with everyone in the room
- **Synced PDF viewer** — Review PDF documents collaboratively with real-time page sync
- **Live chat** — Chat with roommates in real time while watching or reading
- **WebSocket-first architecture** — All sync events are handled via WebSockets for minimal latency

---

## Tech Stack

| Layer    | Technology                     |
|----------|-------------------------------|
| Frontend | JavaScript, CSS, HTML          |
| Backend  | Node.js (WebSocket server)     |
| Realtime | WebSockets                     |
| Hosting  | Vercel (client)                |

**Language breakdown:** JavaScript (82%) · CSS (16%) · HTML (1%)

---

## Project Structure

```
togethery/
├── client/   # Frontend — UI, YouTube player, PDF viewer, chat
└── server/   # Backend — WebSocket server, room management
```

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/coplikso/togethery.git
cd togethery
```

### Running the Server

```bash
cd server
npm install
npm start
```

### Running the Client

```bash
cd client
npm install
npm run dev
```

Then open your browser and navigate to `http://localhost:5173` (or whichever port is configured).

---

## How It Works

1. **Create a room** — A unique room ID is generated for your session
2. **Share the link** — Send the room URL to friends
3. **Pick content** — Paste a YouTube URL or upload a PDF
4. **Watch/read together** — All playback controls and page navigation are broadcast to everyone in the room via WebSockets in real time
5. **Chat** — Send messages visible to all room members instantly

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## License

This project is open source. See the repository for details.

---

*Built with ❤️ by [coplikso](https://github.com/coplikso)*
