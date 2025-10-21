# Phase 08: Admin Voting Management

**Status:** Complete
**Started:** 2025-01-20
**Completed:** 2025-01-20

## Objective
Implement admin controls for managing the voting process, including viewing vote counts, tallying votes, and automatically eliminating the player with the most votes.

## Prerequisites
- [x] Phase 07 complete (Player List and Voting System)
- [x] Players can submit votes
- [x] Admin can view player list and eliminate players manually

## User Requirements
- Admin needs to see current vote counts
- Admin needs a way to "close voting" and tally results
- Player with most votes should be automatically eliminated
- System should handle vote clearing for next round

## Tasks

### Backend
- [ ] Add vote count display to admin API endpoint
- [ ] Create API endpoint to tally votes and eliminate winner
- [ ] Add vote clearing functionality (for next round)
- [ ] Handle tie scenarios (multiple players with same vote count)

### Frontend - Admin Page
- [ ] Display current vote counts for each player
- [ ] Show who voted for whom (optional detail view)
- [ ] Add "Tally Votes" or "Close Voting" button
- [ ] Show vote summary before confirming elimination
- [ ] Add "Clear Votes" button for starting new round

### Game State Management (Optional)
- [ ] Consider adding voting phase state to game model
- [ ] Track voting rounds/history (optional)

## Acceptance Criteria
- [ ] Admin can see real-time vote counts for all players
- [ ] Admin can tally votes with one button click
- [ ] Player with most votes is automatically eliminated
- [ ] Tie handling: Admin is prompted to choose between tied players
- [ ] Votes can be cleared for next voting round
- [ ] Vote counts update in real-time as players vote
- [ ] Eliminated player's status updates immediately

## Technical Design

### Vote Display on Admin Page

**Option 1: Simple Vote Counts**
```tsx
<div className="vote-summary">
  <h3>Current Votes</h3>
  {voteCounts.map(({ playerId, playerName, voteCount }) => (
    <div key={playerId}>
      {playerName}: {voteCount} votes
    </div>
  ))}
</div>
```

**Option 2: Detailed Vote Breakdown**
```tsx
<div className="vote-details">
  <h3>Vote Breakdown</h3>
  {players.map(player => (
    <div key={player.id}>
      <strong>{player.name}</strong> ({votesFor(player.id).length} votes)
      <ul>
        {votesFor(player.id).map(vote => (
          <li>{getPlayerName(vote.playerId)} voted for {player.name}</li>
        ))}
      </ul>
    </div>
  ))}
</div>
```

**Recommendation:** Start with Option 1 (simple counts), add Option 2 as expandable detail

### Tally Votes API

**Endpoint:** `POST /api/games/[gameId]/tally-votes`

**Request:**
```json
{
  "gameId": "abc123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "eliminatedPlayer": {
    "id": "player123",
    "name": "Harry Potter",
    "voteCount": 5
  },
  "voteSummary": {
    "player123": 5,
    "player456": 3,
    "player789": 1
  }
}
```

**Response (Tie):**
```json
{
  "success": false,
  "tie": true,
  "tiedPlayers": [
    { "id": "player123", "name": "Harry Potter", "voteCount": 3 },
    { "id": "player456", "name": "Ron Weasley", "voteCount": 3 }
  ],
  "voteSummary": { ... }
}
```

**Logic:**
1. Get all votes for the game
2. Count votes for each target player
3. Find player(s) with most votes
4. If tie, return tie information for admin to resolve
5. If clear winner, eliminate that player
6. Return results

### Tie Handling

**Option 1: Admin Chooses**
- Return tie information to frontend
- Show modal asking admin to select which player to eliminate
- Make second API call with chosen player

**Option 2: No Elimination on Tie**
- If tie, nobody is eliminated
- Admin must handle manually or re-vote

**Option 3: Random Selection**
- Randomly select one of tied players
- Not recommended for fairness

**Recommendation:** Option 1 (Admin Chooses)

### Vote Clearing

**Endpoint:** `DELETE /api/games/[gameId]/votes`

**Purpose:** Clear all votes for next voting round

**When to use:**
- After elimination is complete
- Before starting new day phase
- Manual reset by admin

### Database Changes

**No schema changes needed** - existing votes table is sufficient

**New model functions needed:**
- `getVoteCountsByGame(gameId)` - Already exists! (`getVoteCounts()`)
- `getPlayerWithMostVotes(gameId)` - New
- `deleteVotesByGame(gameId)` - Already exists!

## UI/UX Design

### Admin Page Vote Section

```
┌─────────────────────────────────────┐
│ Voting Summary                      │
├─────────────────────────────────────┤
│ Harry Potter         ■■■■■ 5 votes  │
│ Ron Weasley          ■■■ 3 votes    │
│ Draco Malfoy         ■ 1 vote       │
│ (3 players haven't voted)           │
├─────────────────────────────────────┤
│ [Tally Votes & Eliminate]           │
│ [Clear Votes]                       │
└─────────────────────────────────────┘
```

### Tally Confirmation Modal

```
┌─────────────────────────────────────┐
│ Confirm Vote Tally                  │
├─────────────────────────────────────┤
│ Harry Potter has the most votes (5) │
│                                     │
│ This will eliminate Harry Potter.   │
│                                     │
│ [Confirm Elimination] [Cancel]      │
└─────────────────────────────────────┘
```

### Tie Resolution Modal

```
┌─────────────────────────────────────┐
│ Vote Tie Detected                   │
├─────────────────────────────────────┤
│ The following players are tied:     │
│                                     │
│ ● Harry Potter - 3 votes            │
│ ● Ron Weasley - 3 votes             │
│                                     │
│ Select player to eliminate:         │
│ ( ) Harry Potter                    │
│ ( ) Ron Weasley                     │
│                                     │
│ [Eliminate Selected] [Cancel]       │
└─────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: Vote Display (MVP)
1. Add vote counts to admin page
2. Real-time updates via polling

### Phase 2: Tally Votes
1. Create tally API endpoint
2. Implement winner calculation
3. Add tally button to admin page
4. Auto-eliminate winner

### Phase 3: Tie Handling
1. Detect ties in API
2. Return tie information
3. Show tie resolution modal
4. Allow admin to choose

### Phase 4: Vote Clearing
1. Add clear votes button
2. Confirm before clearing
3. Reset for next round

## Security Considerations
- Tally endpoint should verify admin access (future: add admin authentication)
- Validate game exists before tallying
- Ensure only alive players can be eliminated
- Prevent double-elimination

## Edge Cases
- What if nobody voted? (No elimination, show message)
- What if only 1 vote cast? (Still eliminate that player)
- What if player already eliminated? (Skip, show error)
- What if game has no players? (Show error)

## Testing Checklist
- [ ] Vote counts display correctly
- [ ] Vote counts update in real-time
- [ ] Tally eliminates correct player
- [ ] Tie detection works
- [ ] Tie resolution allows admin choice
- [ ] Clear votes removes all votes
- [ ] No votes scenario handled gracefully
- [ ] Already eliminated player error handled

## Files to Create/Modify

### New Files
- `src/app/api/games/[gameId]/tally-votes/route.ts` - Tally and eliminate endpoint

### Modified Files
- `src/app/admin/game/[id]/page.tsx` - Add vote display and tally UI
- `src/app/api/games/by-id/[id]/admin/route.ts` - Include vote counts in response
- `src/lib/models/vote.ts` - Add `getPlayerWithMostVotes()` helper

## Future Enhancements
- Vote history tracking
- Voting phase state management
- Automatic vote clearing after elimination
- Vote submission deadline/timer
- Anonymous voting mode
- Revote functionality

## Notes
- This phase focuses on admin control, not automatic game flow
- Future phases may add automated day/night cycles
- Consider adding voting "rounds" tracking later
- For MVP, manual vote clearing is acceptable
