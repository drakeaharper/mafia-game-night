# Phase 05: Admin Interface (Game Master UI)

**Status:** Complete
**Started:** 2025-10-19
**Completed:** 2025-10-19

## Objective
Create the Game Master admin interface for creating games, viewing the waiting room, issuing role cards, and managing game state.

## Prerequisites
- [x] Phase 00-04 completed
- [x] API routes functional
- [x] Can create games and join games via API

## Tasks
- [ ] Create admin landing page (`/admin`)
- [ ] Create game creation form with theme selection
- [ ] Display generated game code and join link
- [ ] Create waiting room view showing joined players
- [ ] Add "Issue Cards" button (only available when enough players)
- [ ] Add player count indicator
- [ ] Generate QR code for easy joining
- [ ] Add game state display
- [ ] Style with Tailwind CSS (mobile-first)
- [ ] Add auto-refresh for waiting room (polling or SSR)
- [ ] Test on mobile device

## Acceptance Criteria
- [x] Can navigate to `/admin` and see create game form
- [x] Can select theme and player count
- [x] After creating, shows game code prominently
- [x] Waiting room updates as players join
- [x] Issue cards button appears when player count >= configured amount
- [x] Issue cards button triggers role assignment
- [x] QR code displays correctly
- [x] UI is mobile-responsive
- [x] No layout shifts or visual bugs

## Technical Notes

### Page Structure
```
src/app/admin/
├── page.tsx                    # Landing/Create Game
├── game/
│   └── [id]/
│       └── page.tsx            # Waiting Room & Game Management
└── components/
    ├── CreateGameForm.tsx
    ├── WaitingRoom.tsx
    ├── GameCode.tsx
    └── QRCode.tsx
```

### Admin Landing Page

**src/app/admin/page.tsx:**
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [theme, setTheme] = useState('classic');
  const [playerCount, setPlayerCount] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleCreateGame = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, playerCount }),
      });

      if (response.ok) {
        const game = await response.json();
        router.push(`/admin/game/${game.id}`);
      } else {
        alert('Failed to create game');
      }
    } catch (error) {
      console.error(error);
      alert('Error creating game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto mt-12">
        <h1 className="text-3xl font-bold mb-8">Mafia Game Night</h1>
        <h2 className="text-xl mb-4">Create New Game</h2>

        {/* Theme Selection */}
        <div className="mb-4">
          <label className="block mb-2">Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full p-2 bg-gray-800 rounded"
          >
            <option value="classic">Classic Mafia</option>
            <option value="harry-potter">Harry Potter</option>
          </select>
        </div>

        {/* Player Count */}
        <div className="mb-6">
          <label className="block mb-2">Player Count</label>
          <input
            type="number"
            min="7"
            max="20"
            value={playerCount}
            onChange={(e) => setPlayerCount(parseInt(e.target.value))}
            className="w-full p-2 bg-gray-800 rounded"
          />
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreateGame}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 p-3 rounded font-bold disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Game'}
        </button>
      </div>
    </div>
  );
}
```

### Waiting Room Page

**src/app/admin/game/[id]/page.tsx:**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import QRCode from 'qrcode';

interface Game {
  id: string;
  code: string;
  theme: string;
  state: string;
  config: {
    playerCount: number;
  };
}

interface Player {
  id: string;
  name: string;
  hasRole: boolean;
}

export default function AdminGamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Fetch game data
  const fetchGame = async () => {
    const response = await fetch(`/api/games/by-id/${gameId}`);
    if (response.ok) {
      const data = await response.json();
      setGame(data);
      setPlayers(data.players || []);
    }
  };

  // Generate QR code
  useEffect(() => {
    if (game?.code) {
      const joinUrl = `${window.location.origin}/game/${game.code}`;
      QRCode.toDataURL(joinUrl).then(setQrCodeUrl);
    }
  }, [game?.code]);

  // Poll for updates
  useEffect(() => {
    fetchGame();
    const interval = setInterval(fetchGame, 3000); // Every 3 seconds
    return () => clearInterval(interval);
  }, [gameId]);

  // Issue cards
  const handleIssueCards = async () => {
    const response = await fetch(`/api/games/by-id/${gameId}/issue-cards`, {
      method: 'POST',
    });

    if (response.ok) {
      fetchGame(); // Refresh
      alert('Cards issued! Players can now view their roles.');
    } else {
      alert('Failed to issue cards');
    }
  };

  if (!game) {
    return <div className="p-4">Loading...</div>;
  }

  const canIssueCards = players.length >= game.config.playerCount && game.state === 'waiting';

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Game Master Console</h1>

        {/* Game Code */}
        <div className="bg-gray-800 p-6 rounded mb-4 text-center">
          <p className="text-sm text-gray-400 mb-2">Game Code</p>
          <p className="text-5xl font-bold tracking-widest">{game.code}</p>
          <p className="text-sm text-gray-400 mt-4">
            Players: {players.length} / {game.config.playerCount}
          </p>
        </div>

        {/* QR Code */}
        {qrCodeUrl && (
          <div className="bg-white p-4 rounded mb-4 text-center">
            <img src={qrCodeUrl} alt="QR Code" className="mx-auto" style={{ width: 200 }} />
            <p className="text-gray-600 text-sm mt-2">Scan to join</p>
          </div>
        )}

        {/* Players List */}
        <div className="bg-gray-800 p-4 rounded mb-4">
          <h2 className="font-bold mb-3">Players ({players.length})</h2>
          {players.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Waiting for players to join...</p>
          ) : (
            <ul className="space-y-2">
              {players.map((player) => (
                <li key={player.id} className="bg-gray-700 p-3 rounded">
                  {player.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Issue Cards Button */}
        {game.state === 'waiting' && (
          <button
            onClick={handleIssueCards}
            disabled={!canIssueCards}
            className="w-full bg-red-600 hover:bg-red-700 p-4 rounded font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {canIssueCards ? 'Issue Role Cards' : `Need ${game.config.playerCount - players.length} more players`}
          </button>
        )}

        {game.state === 'active' && (
          <div className="bg-green-800 p-4 rounded text-center">
            <p className="font-bold">Game Active!</p>
            <p className="text-sm">Players have received their roles.</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Components

**src/app/admin/components/GameCode.tsx:**
```typescript
interface GameCodeProps {
  code: string;
}

export function GameCode({ code }: GameCodeProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    alert('Code copied!');
  };

  return (
    <div className="bg-gray-800 p-6 rounded text-center">
      <p className="text-sm text-gray-400 mb-2">Game Code</p>
      <p className="text-5xl font-bold tracking-widest mb-4">{code}</p>
      <button
        onClick={copyToClipboard}
        className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm"
      >
        Copy Code
      </button>
    </div>
  );
}
```

## Styling Guidelines

### Color Scheme
- Background: `bg-gray-900`
- Cards: `bg-gray-800`
- Primary Button: `bg-red-600` (Mafia red theme)
- Text: `text-white` / `text-gray-400`

### Mobile-First Design
- Use `max-w-md` or `max-w-2xl` for centered layouts
- Large touch targets (min 48px height for buttons)
- Readable font sizes (text-lg or larger for important info)
- Adequate padding for thumb zones

## Files Created/Modified

**Created:**
- `src/app/admin/page.tsx` - Admin landing/create game
- `src/app/admin/game/[id]/page.tsx` - Waiting room
- `src/app/admin/components/GameCode.tsx` - Game code display
- `src/app/admin/components/WaitingRoom.tsx` - Player list (optional)

**Modified:**
- `package.json` - Add `qrcode` if not already added

## Testing Checklist
- [ ] Visit `/admin` on desktop
- [ ] Create a game and get redirected to waiting room
- [ ] See game code displayed prominently
- [ ] See QR code displayed
- [ ] Open on mobile device and verify layout
- [ ] Join game from another device
- [ ] Verify player appears in waiting room
- [ ] Add enough players and see "Issue Cards" button enable
- [ ] Click "Issue Cards" and verify game state changes
- [ ] Test with both classic and Harry Potter themes

## Next Steps
- **Phase 06:** Player Interface
  - Join game page
  - Role card display
  - Game status view

## Notes
- Use client components (`'use client'`) for interactivity
- Poll every 3 seconds for waiting room updates (simple approach)
- Could use Server-Sent Events or WebSockets for real-time updates (future enhancement)
- QR code makes joining easy - scan and auto-fill game code
- Game Master should be able to access from mobile phone during game
- Consider adding game deletion/cancellation functionality
- Add visual feedback for loading states
