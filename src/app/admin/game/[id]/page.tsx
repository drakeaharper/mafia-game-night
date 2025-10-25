'use client';

export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import QRCode from 'qrcode';
import { getRandomDeathMessage } from '@/data/death-messages';

interface Game {
  id: string;
  code: string;
  theme: string;
  state: string;
  config: {
    playerCount: number;
    enableVoting?: boolean;
    roleDistribution?: Record<string, number>;
    theme?: string;
  };
  players: Array<{
    id: string;
    name: string;
    hasRole: boolean;
    isAlive: boolean;
    role: string | null;
    roleData: {
      name: string;
      alignment: string;
      description: string;
      abilities?: any[];
      cardInstructions?: string[];
      flavor?: {
        color?: string;
        flavorText?: string;
      };
    } | null;
  }>;
  votes?: {
    all: Array<{
      voterId: string;
      voterName: string;
      targetId: string;
      targetName: string;
      createdAt: number;
    }>;
    counts: Record<string, number>;
    totalVotes: number;
  };
}

export default function AdminGamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const [game, setGame] = useState<Game | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  const [editingUrl, setEditingUrl] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [deathMessage, setDeathMessage] = useState('');
  const [showDeathMessage, setShowDeathMessage] = useState(false);
  const [showTallyConfirm, setShowTallyConfirm] = useState(false);
  const [showTieModal, setShowTieModal] = useState(false);
  const [tiedPlayers, setTiedPlayers] = useState<Array<{id: string; name: string; voteCount: number}>>([]);
  const [selectedTiePlayer, setSelectedTiePlayer] = useState('');
  const [tallying, setTallying] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showVoteDetails, setShowVoteDetails] = useState(false);
  const [rerolling, setRerolling] = useState(false);

  // Initialize base URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      setBaseUrl(origin);
      setUrlInput(origin);
    }
  }, []);

  // Fetch game data with full role information for admin
  const fetchGame = async () => {
    try {
      const response = await fetch(`/api/games/by-id/${gameId}/admin`);
      if (response.ok) {
        const data = await response.json() as Game;
        setGame(data);
      }
    } catch (error) {
      console.error('Error fetching game:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate QR code
  useEffect(() => {
    if (game?.code && baseUrl) {
      const joinUrl = `${baseUrl}/game/${game.code}`;
      QRCode.toDataURL(joinUrl, { width: 256 })
        .then(setQrCodeUrl)
        .catch(err => console.error('Error generating QR code:', err));
    }
  }, [game?.code, baseUrl]);

  // Poll for updates every 5 seconds
  useEffect(() => {
    fetchGame();
    const interval = setInterval(fetchGame, 5000);
    return () => clearInterval(interval);
  }, [gameId]);

  // Issue cards
  const handleIssueCards = async () => {
    if (!game) return;

    setIssuing(true);
    try {
      const response = await fetch(`/api/games/by-id/${gameId}/issue-cards`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchGame(); // Refresh game state
        alert('Cards issued! Players can now view their roles.');
      } else {
        const error = await response.json() as { error?: string };
        alert(error.error || 'Failed to issue cards');
      }
    } catch (error) {
      console.error('Error issuing cards:', error);
      alert('Error issuing cards');
    } finally {
      setIssuing(false);
    }
  };

  // Reroll roles
  const handleRerollRoles = async () => {
    if (!game) return;

    if (!confirm('Reroll all roles? This will:\n• Assign new random roles to all players\n• Reset all players to alive status\n• Clear all votes\n\nThis cannot be undone.')) {
      return;
    }

    setRerolling(true);
    try {
      const response = await fetch(`/api/games/by-id/${gameId}/reroll-roles`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchGame(); // Refresh game state
        alert('Roles rerolled! All players have new roles and have been reset to alive status. All votes cleared.');
      } else {
        const error = await response.json() as { error?: string };
        alert(error.error || 'Failed to reroll roles');
      }
    } catch (error) {
      console.error('Error rerolling roles:', error);
      alert('Error rerolling roles');
    } finally {
      setRerolling(false);
    }
  };

  // Helper function to copy text with fallback for non-HTTPS contexts
  const copyToClipboard = async (text: string) => {
    try {
      // Try modern clipboard API first (requires HTTPS)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      // Fall through to fallback method
    }

    // Fallback for HTTP contexts
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      return false;
    }
  };

  // Copy code to clipboard
  const copyCode = async () => {
    if (game?.code && !codeCopied) {
      const success = await copyToClipboard(game.code);
      if (success) {
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
      }
    }
  };

  // Copy join URL to clipboard
  const copyJoinUrl = async () => {
    if (game?.code && baseUrl && !urlCopied) {
      const joinUrl = `${baseUrl}/game/${game.code}`;
      const success = await copyToClipboard(joinUrl);
      if (success) {
        setUrlCopied(true);
        setTimeout(() => setUrlCopied(false), 2000);
      }
    }
  };

  // Toggle player alive/eliminated status
  const togglePlayerStatus = async (playerId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/players/${playerId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAlive: !currentStatus }),
      });

      if (response.ok) {
        // Refresh game data
        fetchGame();
      } else {
        const error = await response.json() as { error?: string };
        alert(error.error || 'Failed to update player status');
      }
    } catch (error) {
      console.error('Error updating player status:', error);
      alert('Error updating player status');
    }
  };

  // Update base URL
  const handleUpdateUrl = () => {
    setBaseUrl(urlInput);
    setEditingUrl(false);
  };

  // Cancel URL editing
  const handleCancelEdit = () => {
    setUrlInput(baseUrl);
    setEditingUrl(false);
  };

  // Tally votes
  const handleTallyVotes = async (targetPlayerId?: string) => {
    if (!game) return;

    setTallying(true);
    try {
      const response = await fetch(`/api/games/${gameId}/tally-votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetPlayerId }),
      });

      const data = await response.json() as {
        success?: boolean;
        tie?: boolean;
        tiedPlayers?: Array<{id: string; name: string; voteCount: number}>;
        eliminatedPlayer?: {name: string; voteCount: number};
        error?: string;
      };

      if (data.success) {
        // Success - player eliminated
        setShowTallyConfirm(false);
        setShowTieModal(false);
        alert(`${data.eliminatedPlayer?.name} has been eliminated with ${data.eliminatedPlayer?.voteCount} votes!\n\nVotes have been automatically cleared for the next round.`);
        fetchGame(); // Refresh game data
      } else if (data.tie) {
        // Tie detected - show tie resolution modal
        setShowTallyConfirm(false);
        setTiedPlayers(data.tiedPlayers || []);
        setShowTieModal(true);
      } else {
        // No votes or error
        alert(data.error || 'Failed to tally votes');
        setShowTallyConfirm(false);
      }
    } catch (error) {
      console.error('Error tallying votes:', error);
      alert('Error tallying votes');
    } finally {
      setTallying(false);
    }
  };

  // Resolve tie
  const handleResolveTie = () => {
    if (!selectedTiePlayer) {
      alert('Please select a player to eliminate');
      return;
    }
    handleTallyVotes(selectedTiePlayer);
  };

  // Clear votes
  const handleClearVotes = async () => {
    if (!confirm('Clear all votes? This cannot be undone.')) {
      return;
    }

    setClearing(true);
    try {
      const response = await fetch(`/api/games/${gameId}/tally-votes`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('All votes cleared!');
        fetchGame(); // Refresh game data
      } else {
        const error = await response.json() as { error?: string };
        alert(error.error || 'Failed to clear votes');
      }
    } catch (error) {
      console.error('Error clearing votes:', error);
      alert('Error clearing votes');
    } finally {
      setClearing(false);
    }
  };

  // Check if using localhost
  const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-xl">Loading game...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Game not found</p>
          <a href="/admin" className="text-red-500 hover:text-red-400">
            Create a new game
          </a>
        </div>
      </div>
    );
  }

  const canIssueCards = game.players.length >= game.config.playerCount && game.state === 'waiting';
  const playersNeeded = Math.max(0, game.config.playerCount - game.players.length);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <a
            href="/admin"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
          >
            <span className="mr-2">←</span>
            Home
          </a>
          <h1 className="text-2xl font-bold mb-1">Game Master Console</h1>
          <p className="text-gray-400 capitalize">{game.theme.replace('-', ' ')} Theme</p>
        </div>

        {/* Game Code */}
        <div className="bg-gray-800 p-6 rounded-lg mb-4 text-center">
          <p className="text-sm text-gray-400 mb-2">Game Code</p>
          <p className="text-5xl font-bold tracking-widest mb-4">{game.code}</p>
          <button
            onClick={copyCode}
            disabled={codeCopied}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              codeCopied
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {codeCopied ? '✓ Copied!' : 'Copy Code'}
          </button>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400 mb-1">
              Players: {game.players.length} / {game.config.playerCount}
            </p>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(game.players.length / game.config.playerCount) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Join URL */}
        <div className="bg-gray-800 p-4 rounded-lg mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Join URL</p>
            {!editingUrl && (
              <button
                onClick={() => setEditingUrl(true)}
                className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition-colors"
              >
                Edit
              </button>
            )}
          </div>

          {editingUrl ? (
            <div className="space-y-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded text-sm font-mono"
                placeholder="http://192.168.1.100:3000"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateUrl}
                  className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm transition-colors"
                >
                  Update
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-gray-700 p-3 rounded mb-2 break-all text-sm font-mono">
                {baseUrl}/game/{game.code}
              </div>
              <button
                onClick={copyJoinUrl}
                disabled={urlCopied}
                className={`w-full px-4 py-2 rounded text-sm transition-colors ${
                  urlCopied
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {urlCopied ? '✓ Copied!' : 'Copy Join URL'}
              </button>
            </>
          )}

          {isLocalhost && (
            <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-700 rounded text-xs text-yellow-300">
              ⚠️ Using localhost - QR code won&apos;t work on other devices. Click Edit to use your network IP (e.g., http://192.168.1.x:3000)
            </div>
          )}
        </div>

        {/* QR Code */}
        {qrCodeUrl && (
          <div className="bg-white p-4 rounded-lg mb-4 text-center">
            <img src={qrCodeUrl} alt="QR Code" className="mx-auto" />
            <p className="text-gray-600 text-sm mt-2">Scan to join game</p>
          </div>
        )}

        {/* Death Message Generator */}
        {game.state === 'active' && (
          <div className="bg-gray-800 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold">Death Message Generator</h2>
              <button
                onClick={() => {
                  const message = getRandomDeathMessage(game.theme);
                  setDeathMessage(message);
                  setShowDeathMessage(true);
                }}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded font-medium transition-colors text-sm"
              >
                🎲 Generate
              </button>
            </div>
            {showDeathMessage && deathMessage && (
              <div className="bg-gray-700 p-4 rounded border-2 border-purple-500 animate-pulse">
                <p className="text-center italic text-lg">
                  <span className="text-purple-300">&quot;</span>
                  {deathMessage}
                  <span className="text-purple-300">&quot;</span>
                </p>
              </div>
            )}
            {!showDeathMessage && (
              <p className="text-gray-400 text-sm text-center">
                Click Generate for a whimsical death message
              </p>
            )}
          </div>
        )}

        {/* Players List */}
        <div className="bg-gray-800 p-4 rounded-lg mb-4">
          <h2 className="font-bold mb-3">
            Players ({game.players.length})
            {game.state === 'waiting' && (
              <span className="ml-2 text-sm text-green-500 animate-pulse">● Waiting</span>
            )}
            {game.state === 'active' && (
              <span className="ml-2 text-sm text-blue-500">● Active</span>
            )}
          </h2>

          {game.players.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              Waiting for players to join...
            </p>
          ) : (
            <ul className="space-y-2">
              {game.players.map((player) => {
                const alignmentColors = {
                  good: 'bg-blue-900 text-blue-300 border-blue-600',
                  evil: 'bg-red-900 text-red-300 border-red-600',
                  neutral: 'bg-purple-900 text-purple-300 border-purple-600',
                };

                const alignmentColor = player.roleData
                  ? alignmentColors[player.roleData.alignment as keyof typeof alignmentColors]
                  : 'bg-gray-600 text-gray-300 border-gray-500';

                return (
                  <li
                    key={player.id}
                    className={`p-3 rounded border-2 transition-all ${
                      player.isAlive
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-gray-800 border-red-900 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium ${!player.isAlive ? 'line-through text-gray-500' : ''}`}>
                        {player.name}
                      </span>
                      <div className="flex gap-2 items-center">
                        {player.hasRole ? (
                          <span className={`text-xs px-2 py-1 rounded border ${alignmentColor}`}>
                            {player.roleData?.name || 'Unknown'}
                          </span>
                        ) : (
                          <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-1 rounded">
                            No Role
                          </span>
                        )}
                        {player.isAlive ? (
                          <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">
                            ● Alive
                          </span>
                        ) : (
                          <span className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded">
                            ☠ Eliminated
                          </span>
                        )}
                      </div>
                    </div>

                    {player.hasRole && player.roleData && (
                      <div className="mt-2 pt-2 border-t border-gray-600">
                        <p className="text-xs text-gray-400 mb-1">
                          <span className="font-semibold">Alignment:</span> {player.roleData.alignment}
                        </p>
                        <p className="text-xs text-gray-400 mb-2">
                          {player.roleData.description}
                        </p>
                        {game.state === 'active' && (
                          <button
                            onClick={() => togglePlayerStatus(player.id, player.isAlive)}
                            className={`w-full text-xs px-3 py-2 rounded font-medium transition-colors ${
                              player.isAlive
                                ? 'bg-red-900 hover:bg-red-800 text-red-200'
                                : 'bg-green-900 hover:bg-green-800 text-green-200'
                            }`}
                          >
                            {player.isAlive ? '☠ Eliminate Player' : '❤️ Revive Player'}
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Voting Section */}
        {game.config?.enableVoting && game.state === 'active' && game.votes && (
          <div className="bg-gray-800 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold">
                Voting Summary
                {game.votes.totalVotes > 0 && (
                  <span className="ml-2 text-sm text-gray-400">
                    ({game.votes.totalVotes} vote{game.votes.totalVotes !== 1 ? 's' : ''} cast)
                  </span>
                )}
              </h2>
              {game.votes.totalVotes > 0 && (
                <button
                  onClick={() => setShowVoteDetails(!showVoteDetails)}
                  className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition-colors"
                >
                  {showVoteDetails ? 'Hide Details' : 'Show Details'}
                </button>
              )}
            </div>

            {game.votes.totalVotes === 0 ? (
              <p className="text-gray-400 text-center py-4">No votes cast yet</p>
            ) : (
              <>
                {/* Vote Counts */}
                <div className="space-y-2 mb-4">
                  {Object.entries(game.votes.counts)
                    .sort(([, a], [, b]) => b - a)
                    .map(([playerId, count]) => {
                      const player = game.players.find(p => p.id === playerId);
                      const maxVotes = Math.max(...Object.values(game.votes!.counts));
                      const percentage = (count / maxVotes) * 100;

                      return (
                        <div key={playerId} className="bg-gray-700 p-3 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{player?.name || 'Unknown'}</span>
                            <span className="text-sm bg-red-900 text-red-300 px-2 py-1 rounded">
                              {count} vote{count !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-red-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Vote Details */}
                {showVoteDetails && (
                  <div className="bg-gray-700 p-3 rounded mb-4">
                    <h3 className="text-sm font-bold mb-2">Vote Details</h3>
                    <div className="space-y-1 text-sm">
                      {game.votes.all.map((vote, idx) => (
                        <div key={idx} className="text-gray-300">
                          <span className="text-blue-300">{vote.voterName}</span>
                          {' → '}
                          <span className="text-red-300">{vote.targetName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tally and Clear Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowTallyConfirm(true)}
                    className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-3 rounded font-bold transition-colors"
                  >
                    Tally Votes & Eliminate
                  </button>
                  <button
                    onClick={handleClearVotes}
                    disabled={clearing}
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded font-medium transition-colors disabled:opacity-50"
                  >
                    {clearing ? 'Clearing...' : 'Clear Votes'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tally Confirmation Modal */}
        {showTallyConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Confirm Vote Tally</h2>
              {game.votes && game.votes.totalVotes > 0 ? (
                <>
                  <p className="text-gray-400 mb-4">
                    This will eliminate the player with the most votes.
                  </p>
                  <div className="bg-gray-700 p-3 rounded mb-4">
                    <h3 className="text-sm font-bold mb-2">Current Votes:</h3>
                    {Object.entries(game.votes.counts)
                      .sort(([, a], [, b]) => b - a)
                      .map(([playerId, count]) => {
                        const player = game.players.find(p => p.id === playerId);
                        return (
                          <div key={playerId} className="text-sm text-gray-300">
                            {player?.name}: {count} vote{count !== 1 ? 's' : ''}
                          </div>
                        );
                      })}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTallyVotes()}
                      disabled={tallying}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-3 rounded font-bold transition-colors"
                    >
                      {tallying ? 'Tallying...' : 'Confirm Elimination'}
                    </button>
                    <button
                      onClick={() => setShowTallyConfirm(false)}
                      disabled={tallying}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded font-bold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-400 mb-4">No votes have been cast yet.</p>
                  <button
                    onClick={() => setShowTallyConfirm(false)}
                    className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded font-bold transition-colors"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Tie Resolution Modal */}
        {showTieModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Vote Tie Detected</h2>
              <p className="text-gray-400 mb-4">
                The following players are tied. Select which player to eliminate:
              </p>
              <div className="space-y-2 mb-6">
                {tiedPlayers.map((player) => (
                  <label
                    key={player.id}
                    className={`flex items-center p-3 rounded cursor-pointer transition-colors ${
                      selectedTiePlayer === player.id
                        ? 'bg-red-900 border-2 border-red-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tiePlayer"
                      value={player.id}
                      checked={selectedTiePlayer === player.id}
                      onChange={(e) => setSelectedTiePlayer(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <span className="font-medium">{player.name}</span>
                      <span className="ml-2 text-sm text-gray-400">
                        ({player.voteCount} votes)
                      </span>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleResolveTie}
                  disabled={!selectedTiePlayer || tallying}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-3 rounded font-bold transition-colors"
                >
                  {tallying ? 'Eliminating...' : 'Eliminate Selected'}
                </button>
                <button
                  onClick={() => {
                    setShowTieModal(false);
                    setSelectedTiePlayer('');
                  }}
                  disabled={tallying}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Issue Cards Button */}
        {game.state === 'waiting' && (
          <button
            onClick={handleIssueCards}
            disabled={!canIssueCards || issuing}
            className="w-full bg-red-600 hover:bg-red-700 p-4 rounded font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {issuing ? (
              'Issuing Cards...'
            ) : canIssueCards ? (
              'Issue Role Cards'
            ) : (
              `Need ${playersNeeded} More Player${playersNeeded !== 1 ? 's' : ''}`
            )}
          </button>
        )}

        {game.state === 'active' && (
          <div className="space-y-4">
            <div className="bg-green-900 border-2 border-green-600 p-4 rounded text-center">
              <p className="font-bold text-lg">Game Active!</p>
              <p className="text-sm text-green-300 mt-1">
                All players have received their roles.
              </p>
            </div>
            <button
              onClick={handleRerollRoles}
              disabled={rerolling}
              className="w-full bg-purple-600 hover:bg-purple-700 p-4 rounded font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {rerolling ? 'Rerolling Roles...' : '🎲 Reroll Roles'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
