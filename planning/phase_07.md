# Phase 07: Player List and Voting System

**Status:** In Progress
**Started:** 2025-01-20
**Completed:**

## Objective
Implement player list visibility and voting system for gameplay, allowing players to see other players, mark suspicions, and vote for elimination.

## Prerequisites
- [x] Phase 06 complete (Player Interface)
- [x] Admin interface with role visibility
- [x] Player status tracking (alive/eliminated)

## Tasks
- [x] Add votes table to database schema
- [x] Create TypeScript types for votes
- [x] Create vote model CRUD functions
- [ ] Create API endpoint to get all players in game
- [ ] Create API endpoint to submit/retrieve votes
- [ ] Update player page with active players list
- [ ] Add suspicion marking functionality (client-side only)
- [ ] Add voting modal and submission
- [ ] Display eliminated players with revealed roles
- [ ] Add theme-aware text (Eliminated vs In Azkaban)
- [ ] Test all voting and player list features

## Acceptance Criteria
- [ ] Players can view list of all active (living) players in their game
- [ ] Players can mark other players as "suspicious" with local-only indicators
- [ ] Suspicion marks are client-side only and do not persist
- [ ] Players can open voting interface and select a target
- [ ] Players can submit votes for elimination
- [ ] Votes are stored in database with validation
- [ ] Players can see eliminated players listed separately
- [ ] Eliminated players show their revealed roles
- [ ] Theme text changes based on game theme (classic vs harry-potter)
- [ ] Cannot vote for self or already-eliminated players
- [ ] Vote changes/updates existing vote (one vote per player)

## Technical Notes

### Database Schema
Added votes table with foreign keys to games and players:
- Unique constraint on (game_id, player_id) ensures one vote per player per game
- Cascading deletes when game or player is deleted
- Indexes on game_id and player_id for query performance

### Voting Logic
- Players can change their vote by submitting a new target
- `createOrUpdateVote()` function handles both create and update cases
- Votes are upserted based on unique constraint
- Vote counts can be retrieved for admin tally (future feature)

### Client-Side Suspicion Tracking
- Uses React useState with Set<string> for suspicious player IDs
- No API calls or database storage
- Resets on page refresh (acceptable for MVP)
- Simple toggle behavior

### Theme Integration
- Use theme prop from player API response
- Conditional text rendering:
  - Classic: "Eliminated", "Vote to Eliminate"
  - Harry Potter: "In Azkaban", "Send to Azkaban"

### Security/Validation
- Validate player is alive before accepting vote
- Validate target is alive before accepting vote
- Validate player cannot vote for themselves
- Validate player and target belong to same game

## Files Created/Modified

### Created Files
- `src/types/vote.ts` - TypeScript types for votes
- `src/lib/models/vote.ts` - Vote CRUD operations
- `src/app/api/games/[gameId]/players/route.ts` - Get all players endpoint
- `src/app/api/players/[playerId]/vote/route.ts` - Vote submission endpoint

### Modified Files
- `src/lib/db.ts` - Added votes table to schema
- `src/app/player/[id]/page.tsx` - Added player list, voting UI, and eliminated list

## UI Components

### Player List Section
```tsx
<div className="active-players">
  <h2>Active Players ({aliveCount})</h2>
  {alivePlayers.map(player => (
    <div key={player.id}>
      {isSuspicious(player.id) && <span>⭐</span>}
      <span>{player.name}</span>
      <button onClick={() => toggleSuspicious(player.id)}>
        {isSuspicious(player.id) ? 'Unmark' : 'Mark Suspicious'}
      </button>
    </div>
  ))}
</div>
```

### Voting Modal
```tsx
<div className="vote-modal">
  <h2>Vote to Eliminate</h2>
  <select value={voteTarget} onChange={e => setVoteTarget(e.target.value)}>
    <option value="">Select player...</option>
    {alivePlayers.filter(p => p.id !== currentPlayerId).map(player => (
      <option key={player.id} value={player.id}>{player.name}</option>
    ))}
  </select>
  <button onClick={submitVote}>Submit Vote</button>
  <button onClick={closeModal}>Cancel</button>
</div>
```

### Eliminated Players List
```tsx
<div className="eliminated-players">
  <h2>{theme === 'harry-potter' ? 'In Azkaban' : 'Eliminated'} ({eliminatedCount})</h2>
  {eliminatedPlayers.map(player => (
    <div key={player.id}>
      <span>{player.name}</span>
      <span> - {player.roleData?.name}</span>
      <span className={`alignment-${player.roleData?.alignment}`}>
        ({player.roleData?.alignment})
      </span>
    </div>
  ))}
</div>
```

## Next Steps
- Phase 08: Game Flow Management (night/day phases, announcements)
- Phase 09: Admin voting interface (see vote counts, tally votes)
- Future: Vote reveal and automatic elimination based on majority

## Notes
- Suspicion marking is purely client-side for privacy
- Votes are recorded but not automatically tallied (GM manually eliminates for now)
- Future phases will add automatic vote counting and phase management
- This phase focuses on core player voting functionality without automated game flow
