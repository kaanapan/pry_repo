# Taboo 2v2

A modern, real-time 2v2 Taboo game built with React (Vite, Material UI), Zustand, Node.js, Express, and Socket.io.

## Features
- 2v2 team-based Taboo gameplay
- Real-time multiplayer with Socket.io
- Modern Material UI design, dark mode support
- Dynamic score limit and round duration selection
- Role-based UI (leader, guesser, clue-giver, observer)
- Responsive and mobile-friendly
- Masked cards for guessers
- Rematch and lobby management

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd pry_repo
   ```
2. Install dependencies for both client and server:
   ```sh
   cd client
   npm install
   cd ../server
   npm install
   ```

### Running the App

#### Development
1. Start the backend server:
   ```sh
   cd server
   npm run dev
   ```
2. Start the frontend (Vite):
   ```sh
   cd ../client
   npm run dev
   ```
3. Open your browser at [http://localhost:5173](http://localhost:5173)

#### Production
- Build the frontend:
  ```sh
  cd client
  npm run build
  ```
- Serve the static files with your preferred server setup.

## Folder Structure
```
pry_repo/
  client/      # React frontend (Vite, Material UI)
    src/
      pages/
      ...
  server/      # Node.js backend (Express, Socket.io)
    game.ts
    ...
  package.json
  README.md
```

## Environment Variables
- `VITE_SERVER_URL` (client): Set to your backend server URL if not running on the same origin.

## License
MIT
