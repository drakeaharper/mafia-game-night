# Phase 06: Player Interface

**Status:** Not Started
**Started:** -
**Completed:** -

## Objective
Create the player-facing interface for joining games, viewing their assigned role card, and seeing game status.

## Prerequisites
- [x] Phase 00-05 completed
- [x] Admin interface functional
- [x] Can create games and issue cards

## Tasks
- [ ] Create join game page (`/game/[code]`)
- [ ] Create player waiting screen
- [ ] Create role card display page (`/player/[id]`)
- [ ] Design beautiful role card component
- [ ] Add game status indicator
- [ ] Show player's alignment (good/evil/neutral)
- [ ] Display abilities and win conditions
- [ ] Add theme-specific styling (colors, icons)
- [ ] Make fully responsive for mobile
- [ ] Add "keep screen on" meta tag for role viewing
- [ ] Test on various mobile devices

## Acceptance Criteria
- [x] Players can join by entering game code
- [x] Players can join by scanning QR code (auto-fill code)
- [x] Waiting screen updates when cards are issued
- [x] Role card displays all role information clearly
- [x] Role card is visually appealing
- [x] Works perfectly on mobile devices
- [x] No accidental role reveals (secure player ID in URL)
- [x] Theme colors applied correctly

## Technical Notes

### Page Structure
```
src/app/game/
├── [code]/
│   └── page.tsx                # Join game form
└── components/
    └── JoinForm.tsx

src/app/player/
├── [id]/
│   └── page.tsx                # Role card & game status
└── components/
    ├── RoleCard.tsx
    ├── AbilityList.tsx
    └── GameStatus.tsx
```

### Join Game Page

**src/app/game/[code]/page.tsx:**
```typescript
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function JoinGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = (params.code as string)?.toUpperCase() || '';
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/games/by-code/${gameCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.ok) {
        const player = await response.json();
        router.push(`/player/${player.id}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to join game');
      }
    } catch (error) {
      console.error(error);
      alert('Error joining game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold mb-2 text-center">Mafia Game Night</h1>
        <p className="text-gray-400 text-center mb-8">Join Game: {gameCode}</p>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block mb-2 text-lg">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-4 bg-gray-800 rounded text-lg"
              maxLength={20}
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full bg-red-600 hover:bg-red-700 p-4 rounded font-bold text-lg disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join Game'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### Player Page (Waiting & Role Card)

**src/app/player/[id]/page.tsx:**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { RoleCard } from '../components/RoleCard';

interface Player {
  id: string;
  name: string;
  gameId: string;
  role: any;
  isAlive: boolean;
}

export default function PlayerPage() {
  const params = useParams();
  const playerId = params.id as string;
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPlayer = async () => {
    try {
      const response = await fetch(`/api/players/${playerId}`);
      if (response.ok) {
        const data = await response.json();
        setPlayer(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayer();

    // Poll for role assignment if not yet received
    const interval = setInterval(() => {
      if (!player?.role) {
        fetchPlayer();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [playerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Player not found</p>
      </div>
    );
  }

  // Waiting for role assignment
  if (!player.role) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome, {player.name}!</h1>
          <div className="animate-pulse">
            <p className="text-gray-400">Waiting for Game Master to issue cards...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show role card
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <RoleCard player={player} />
    </div>
  );
}
```

### Role Card Component

**src/app/player/components/RoleCard.tsx:**
```typescript
interface RoleCardProps {
  player: {
    name: string;
    role: {
      name: string;
      alignment: 'good' | 'evil' | 'neutral';
      description: string;
      abilities: Array<{
        name: string;
        description: string;
        phase: string;
      }>;
      cardInstructions: string[];
      flavor?: {
        color?: string;
        flavorText?: string;
      };
    };
    isAlive: boolean;
  };
}

export function RoleCard({ player }: RoleCardProps) {
  const { role } = player;

  const alignmentColors = {
    good: 'from-blue-900 to-blue-700',
    evil: 'from-red-900 to-red-700',
    neutral: 'from-purple-900 to-purple-700',
  };

  const alignmentBorder = {
    good: 'border-blue-500',
    evil: 'border-red-500',
    neutral: 'border-purple-500',
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-gray-400 mb-2">Your Role</p>
        <h1 className="text-4xl font-bold">{role.name}</h1>
        {player.isAlive ? (
          <p className="text-green-500 mt-2">Alive</p>
        ) : (
          <p className="text-red-500 mt-2">Eliminated</p>
        )}
      </div>

      {/* Role Card */}
      <div
        className={`bg-gradient-to-br ${alignmentColors[role.alignment]} border-4 ${alignmentBorder[role.alignment]} rounded-lg p-6 mb-6`}
      >
        {/* Flavor Text */}
        {role.flavor?.flavorText && (
          <p className="text-sm italic text-gray-300 mb-4 text-center">
            "{role.flavor.flavorText}"
          </p>
        )}

        {/* Alignment */}
        <div className="text-center mb-6">
          <span className="inline-block bg-black/30 px-4 py-2 rounded-full text-sm uppercase tracking-wide">
            {role.alignment === 'good' ? '⚔️ Good' : role.alignment === 'evil' ? '💀 Evil' : '⚖️ Neutral'}
          </span>
        </div>

        {/* Description */}
        <p className="text-lg mb-6 leading-relaxed">{role.description}</p>

        {/* Abilities */}
        {role.abilities.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3">Abilities</h2>
            <div className="space-y-3">
              {role.abilities.map((ability, idx) => (
                <div key={idx} className="bg-black/20 p-4 rounded">
                  <p className="font-bold mb-1">
                    {ability.name}
                    <span className="ml-2 text-xs text-gray-400 uppercase">({ability.phase})</span>
                  </p>
                  <p className="text-sm text-gray-300">{ability.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="border-t border-white/20 pt-6">
          <h2 className="text-xl font-bold mb-3">Instructions</h2>
          <ul className="space-y-2">
            {role.cardInstructions.map((instruction, idx) => (
              <li key={idx} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{instruction}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Keep Secret Warning */}
      <div className="bg-yellow-900/50 border-2 border-yellow-600 rounded p-4 text-center">
        <p className="font-bold text-yellow-300">⚠️ Keep This Screen Secret!</p>
        <p className="text-sm text-yellow-200 mt-1">
          Don't show your role to other players.
        </p>
      </div>
    </div>
  );
}
```

## Styling Details

### Alignment-Based Theming
- **Good:** Blue gradient (`bg-gradient-to-br from-blue-900 to-blue-700`)
- **Evil:** Red gradient (`bg-gradient-to-br from-red-900 to-red-700`)
- **Neutral:** Purple gradient (`bg-gradient-to-br from-purple-900 to-purple-700`)

### Typography
- Role name: `text-4xl font-bold`
- Section headers: `text-xl font-bold`
- Body text: `text-lg` for readability
- Ability text: `text-sm`

### Mobile Optimization
- Maximum width: `max-w-2xl`
- Large touch targets
- Adequate padding for readability
- Prevent accidental zooming with meta tag

## Meta Tags for Mobile

Add to root layout or player page:
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<meta name="mobile-web-app-capable" content="yes" />
```

## Files Created/Modified

**Created:**
- `src/app/game/[code]/page.tsx` - Join game by code
- `src/app/player/[id]/page.tsx` - Player waiting & role view
- `src/app/player/components/RoleCard.tsx` - Role card display
- `src/app/player/components/AbilityList.tsx` - Abilities display (optional)

## Testing Checklist
- [ ] Visit `/game/ABC123` (use actual game code)
- [ ] Enter name and join game
- [ ] See waiting screen while no role assigned
- [ ] Admin issues cards
- [ ] Waiting screen updates automatically to show role card
- [ ] Role card displays correctly with proper colors
- [ ] All abilities shown
- [ ] Instructions readable
- [ ] Test on iPhone
- [ ] Test on Android
- [ ] Test with Classic theme role
- [ ] Test with Harry Potter theme role
- [ ] Verify different alignments show different colors
- [ ] Check that URL with player ID can't be guessed easily

## Security Notes

### Player ID Protection
- Player IDs are generated with `nanoid` (hard to guess)
- No authentication needed - possession of URL = authorization
- Warn users not to share their player URL
- Could add session cookies for additional security (future enhancement)

### Role Secrecy
- Emphasize "keep this secret" messaging
- Dark theme reduces screen glow
- Consider adding "hide role" toggle for when not actively viewing

## Next Steps
- **Phase 07:** Game Flow Management (Optional)
  - Night/day phase tracking
  - Elimination tracking
  - Win condition detection
- **Phase 08:** Polish & Testing
  - Error handling improvements
  - Loading states
  - Animations
  - End-to-end testing

## Notes
- Keep role card on screen throughout game - no need to navigate away
- Players should bookmark or keep their player URL accessible
- Consider PWA features (Add to Home Screen) in future
- Role card should look like a real physical card for immersion
- Use emojis sparingly for visual interest (⚔️, 💀, ⚖️, ⚠️)
- Test with real users in an actual game night to gather feedback
