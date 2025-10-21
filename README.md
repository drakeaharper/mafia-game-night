# Mafia Game Night

A digital companion app for managing in-person Mafia/Werewolf games.

## Overview

Mafia Game Night helps you run smooth, organized Mafia games at your next gathering. The app handles role distribution, player management, and game flow while keeping the social deduction fun of in-person play.

### Key Features

- **Server-based Architecture:** Run the server on your desktop/laptop
- **Mobile-Friendly Admin Interface:** Control and moderate the game from your phone
  - See all player roles and alignments at a glance
  - Mark players as eliminated/alive during gameplay
  - QR code generation with network IP support
- **Digital Role Cards:** Securely distribute roles to players
- **Player Management:** Handle joins, waiting states, and game progression
- **Multiple Game Variants:** Support for classic Mafia and themed variants
  - Classic Mafia with standard roles
  - Harry Potter theme with custom fonts and themed roles (Death Eaters, Dumbledore, Madam Pomfrey, etc.)
- **Real-time Updates:** Players and admin see updates automatically (5-second polling)

## How It Works

1. **Host starts the server** on a desktop/laptop
2. **Game Master creates a game** - selects theme and configures player count
3. **Players join** by scanning QR code or entering game code
4. **Game Master issues role cards** - system automatically assigns roles
5. **Players receive their role cards** privately on their devices
6. **Game begins** - Game Master can see all roles and mark eliminations as the game progresses
7. **Player statuses update automatically** - eliminated players see their status change in real-time

## Tech Stack

- **Frontend:** Next.js with React
- **Backend:** Next.js API routes
- **Database:** SQLite
- **Hosting:** Self-hosted (local network)

## Project Structure

```
mafia-game-night/
├── base-rules/             # Standard Mafia game rules and roles
├── harry-potter/           # Harry Potter themed variant
├── planning/               # Development phase documentation
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── admin/         # Game Master interface
│   │   ├── api/           # API routes
│   │   ├── game/          # Player join page
│   │   └── player/        # Player role card view
│   ├── lib/               # Database and utilities
│   │   ├── db.ts          # SQLite database connection
│   │   ├── models/        # Database CRUD operations
│   │   └── roles/         # Role system loader
│   └── types/             # TypeScript type definitions
├── README.md              # This file
└── CLAUDE.md             # Development documentation
```

## Use Cases

### Perfect For:
- Game nights with friends
- Team building events
- Party entertainment
- Social gatherings

### Advantages Over Physical Cards:
- No shuffling or role card preparation needed
- Secret roles stay truly secret - each player only sees their own role
- Easy to run multiple games back-to-back
- Built-in support for themed variants with custom styling
- Game Master can track player status without revealing information
- Real-time updates keep everyone synchronized

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/mafia-game-night.git

# Navigate to project directory
cd mafia-game-night

# Install dependencies
npm install

# Run the development server
npm run dev

# Access the app
# Admin interface: http://localhost:3000/admin
# Players join via generated game code or QR code
```

### Network Setup (For Mobile Access)

To allow players on your local network to join:

1. Run the server with network binding:
   ```bash
   npm run dev -- --hostname 0.0.0.0
   ```

2. Find your local IP address (e.g., `192.168.1.20`)

3. On the admin page, click "Edit" next to the Join URL and enter your network IP:
   ```
   http://192.168.1.20:3000
   ```

4. Players can now scan the QR code or enter the game code from their phones!

## Game Variants

The app currently supports multiple Mafia variants:

- **Classic Mafia** - Traditional roles (Mafia, Detective, Doctor, Townsperson, Vigilante)
  - See [base-rules/mafia-base-rules.md](base-rules/mafia-base-rules.md)
- **Harry Potter** - Wizarding world theme with Death Eaters, Dumbledore, Madam Pomfrey, Mad-Eye Moody, and more
  - Custom Harry Potter font styling
  - Themed role descriptions and abilities
  - See [harry-potter/harry-potter-roles.json](harry-potter/harry-potter-roles.json)

More variants coming soon! The theme system makes it easy to create custom variants.

## Development Status

**Current Phase:** MVP Complete! 🎉

### Completed Features
- [x] Base game rules documented
- [x] Harry Potter variant documented with themed roles
- [x] Database schema (SQLite)
- [x] API design and implementation
- [x] Core application development
- [x] Role card distribution system
- [x] Game state management
- [x] Admin interface with:
  - Game creation and configuration
  - QR code generation with network support
  - Player role visibility
  - Player elimination/revival controls
- [x] Player interface with:
  - Game joining via code
  - Role card display with themed styling
  - Real-time status updates

### Planned Features
- [ ] Night/day phase management
- [ ] Game history and statistics
- [ ] Additional themes and custom role builder
- [ ] Production build and deployment guide

## Contributing

This is a personal project, but suggestions and feedback are welcome! Feel free to open an issue with ideas or bug reports.

## License

TBD

## Credits

Mafia was created by Dmitry Davidoff in 1986. This app is a digital tool to enhance in-person play, not a replacement for the social interaction that makes the game fun!

---

**Ready to host an unforgettable game night?** Stay tuned for updates!
