# Mafia Game Night

A digital companion app for managing in-person Mafia/Werewolf games.

## Overview

Mafia Game Night helps you run smooth, organized Mafia games at your next gathering. The app handles role distribution, player management, and game flow while keeping the social deduction fun of in-person play.

### Key Features

- **Server-based Architecture:** Run the server on your desktop/laptop
- **Mobile Admin Interface:** Control and moderate the game from your phone
- **Digital Role Cards:** Securely distribute roles to players
- **Player Management:** Handle joins, waiting states, and game progression
- **Multiple Game Variants:** Support for classic Mafia, themed variants (Harry Potter, etc.)

## How It Works

1. **Host starts the server** on a desktop/laptop
2. **Players connect** via their phones/devices
3. **Players join the game** and enter a waiting state
4. **Admin (Game Master) issues cards** - assigning roles to each player
5. **Players receive their role cards** privately on their devices
6. **Game begins** with the app tracking night/day phases

## Tech Stack

- **Frontend:** Next.js with React
- **Backend:** Next.js API routes
- **Database:** SQLite
- **Hosting:** Self-hosted (local network)

## Project Structure

```
mafia-game-night/
├── base-rules/          # Standard Mafia game rules
├── harry-potter/        # Harry Potter themed variant
├── src/                 # Application source code (TBD)
├── README.md           # This file
└── CLAUDE.md          # Development documentation
```

## Use Cases

### Perfect For:
- Game nights with friends
- Team building events
- Party entertainment
- Social gatherings

### Advantages Over Physical Cards:
- No shuffling or role card preparation
- Secret roles stay truly secret
- Easy to run multiple games back-to-back
- Support for custom roles and variants
- Track game history and statistics

## Getting Started

> **Note:** The application is currently in early development. Setup instructions will be added as the project progresses.

### Prerequisites (Planned)
- Node.js 18+
- npm or yarn

### Installation (Coming Soon)
```bash
# Clone the repository
git clone https://github.com/yourusername/mafia-game-night.git

# Install dependencies
npm install

# Run the development server
npm run dev

# Access the app
# Server: http://localhost:3000
# Admin: http://localhost:3000/admin
```

## Game Variants

This app will support multiple Mafia variants:

- **Classic Mafia** - See [base-rules/mafia-base-rules.md](base-rules/mafia-base-rules.md)
- **Harry Potter (Death Eaters Among Us)** - See [harry-potter/harry-potter-mafia-rules.md](harry-potter/harry-potter-mafia-rules.md)
- More variants coming soon!

## Development Status

**Current Phase:** Planning & Documentation

- [x] Base game rules documented
- [x] Harry Potter variant documented
- [ ] Database schema design
- [ ] API design
- [ ] UI/UX mockups
- [ ] Core application development
- [ ] Role card distribution system
- [ ] Game state management
- [ ] Admin interface
- [ ] Player interface

## Contributing

This is a personal project, but suggestions and feedback are welcome! Feel free to open an issue with ideas or bug reports.

## License

TBD

## Credits

Mafia was created by Dmitry Davidoff in 1986. This app is a digital tool to enhance in-person play, not a replacement for the social interaction that makes the game fun!

---

**Ready to host an unforgettable game night?** Stay tuned for updates!
