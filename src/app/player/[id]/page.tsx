'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Player {
  id: string;
  name: string;
  gameId: string;
  role: any;
  isAlive: boolean;
  theme: string;
}

interface PlayerListItem {
  id: string;
  name: string;
  isAlive: boolean;
  role?: string;
  roleData?: {
    name: string;
    alignment: string;
  };
}

export default function PlayerPage() {
  const params = useParams();
  const playerId = params.id as string;
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerList, setPlayerList] = useState<PlayerListItem[]>([]);
  const [suspiciousPlayers, setSuspiciousPlayers] = useState<Set<string>>(new Set());
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [voteTarget, setVoteTarget] = useState('');
  const [currentVote, setCurrentVote] = useState<{ targetId: string; targetName: string } | null>(null);
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

  const fetchPlayerList = async () => {
    if (!player?.gameId) return;

    try {
      const response = await fetch(`/api/games/${player.gameId}/players`);
      if (response.ok) {
        const data = await response.json();
        setPlayerList(data.players);
      }
    } catch (error) {
      console.error('Error fetching player list:', error);
    }
  };

  const fetchCurrentVote = async () => {
    try {
      const response = await fetch(`/api/players/${playerId}/vote`);
      if (response.ok) {
        const data = await response.json();
        if (data.hasVoted) {
          setCurrentVote({
            targetId: data.targetId,
            targetName: data.targetName,
          });
        } else {
          // Clear vote state when votes are cleared on backend
          setCurrentVote(null);
        }
      }
    } catch (error) {
      console.error('Error fetching vote:', error);
    }
  };

  useEffect(() => {
    fetchPlayer();

    // Poll for updates (role assignment and status changes)
    const interval = setInterval(() => {
      fetchPlayer();
    }, 5000);

    return () => clearInterval(interval);
  }, [playerId]);

  useEffect(() => {
    if (player?.gameId && player?.role) {
      fetchPlayerList();
      fetchCurrentVote();

      // Poll for player list and vote updates
      const interval = setInterval(() => {
        fetchPlayerList();
        fetchCurrentVote();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [player?.gameId, player?.role]);

  const toggleSuspicious = (targetId: string) => {
    setSuspiciousPlayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(targetId)) {
        newSet.delete(targetId);
      } else {
        newSet.add(targetId);
      }
      return newSet;
    });
  };

  const submitVote = async () => {
    if (!voteTarget) return;

    try {
      const response = await fetch(`/api/players/${playerId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetId: voteTarget }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentVote({
          targetId: voteTarget,
          targetName: data.targetName,
        });
        setShowVoteModal(false);
        setVoteTarget('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit vote');
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Error submitting vote');
    }
  };

  // Theme-aware text
  const themeText = {
    eliminated: player?.theme === 'harry-potter' ? 'In Azkaban' : 'Eliminated',
    voteButton: player?.theme === 'harry-potter' ? 'Send to Azkaban' : 'Vote to Eliminate',
    voteHeader: player?.theme === 'harry-potter' ? 'Vote to Send to Azkaban' : 'Vote to Eliminate',
    statusEliminated: player?.theme === 'harry-potter' ? '● In Azkaban' : '● Eliminated',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xl mb-4">Player not found</p>
          <a href="/" className="text-red-500 hover:text-red-400">
            Return home
          </a>
        </div>
      </div>
    );
  }

  // Waiting for role assignment
  if (!player.role) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Welcome, {player.name}!</h1>
          <div className="animate-pulse mb-6">
            <div className="w-16 h-16 bg-red-600 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Waiting for Game Master to issue cards...</p>
          </div>
          <p className="text-sm text-gray-500">
            Keep this page open. Your role will appear automatically.
          </p>
        </div>
      </div>
    );
  }

  // Show role card
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

  const alignmentEmoji = {
    good: '⚔️ Good',
    evil: '💀 Evil',
    neutral: '⚖️ Neutral',
  };

  const alivePlayers = playerList.filter(p => p.isAlive && p.id !== playerId);
  const eliminatedPlayers = playerList.filter(p => !p.isAlive);

  // Apply Harry Potter font if theme is harry-potter
  const isHarryPotter = player.theme === 'harry-potter';
  const titleFont = isHarryPotter ? "font-['Harry_Potter',_serif]" : '';

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-gray-400 mb-2">Your Role</p>
          <h1 className={`text-4xl font-bold mb-2 ${titleFont}`}>{player.role.name}</h1>
          {player.isAlive ? (
            <p className="text-green-500 font-medium">● Alive</p>
          ) : (
            <p className="text-red-500 font-medium">{themeText.statusEliminated}</p>
          )}
        </div>

        {/* Role Card */}
        <div
          className={`bg-gradient-to-br ${alignmentColors[player.role.alignment as keyof typeof alignmentColors]} border-4 ${alignmentBorder[player.role.alignment as keyof typeof alignmentBorder]} rounded-lg p-6 mb-6 shadow-2xl`}
        >
          {/* Flavor Text */}
          {player.role.flavor?.flavorText && (
            <p className="text-sm italic text-gray-300 mb-4 text-center border-b border-white/20 pb-4">
              &quot;{player.role.flavor.flavorText}&quot;
            </p>
          )}

          {/* Alignment */}
          <div className="text-center mb-6">
            <span className="inline-block bg-black/30 px-4 py-2 rounded-full text-sm uppercase tracking-wide font-bold">
              {alignmentEmoji[player.role.alignment as keyof typeof alignmentEmoji]}
            </span>
          </div>

          {/* Description */}
          <p className="text-lg mb-6 leading-relaxed">{player.role.description}</p>

          {/* Abilities */}
          {player.role.abilities && player.role.abilities.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-3">Abilities</h2>
              <div className="space-y-3">
                {player.role.abilities.map((ability: any, idx: number) => (
                  <div key={idx} className="bg-black/20 p-4 rounded">
                    <p className="font-bold mb-1">
                      {ability.name}
                      {ability.phase && (
                        <span className="ml-2 text-xs text-gray-400 uppercase">
                          ({ability.phase})
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-300">{ability.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {player.role.cardInstructions && player.role.cardInstructions.length > 0 && (
            <div className="border-t border-white/20 pt-6">
              <h2 className="text-xl font-bold mb-3">Instructions</h2>
              <ul className="space-y-2">
                {player.role.cardInstructions.map((instruction: string, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Keep Secret Warning */}
        <div className="bg-yellow-900/50 border-2 border-yellow-600 rounded p-4 text-center mb-6">
          <p className="font-bold text-yellow-300">⚠️ Keep This Screen Secret!</p>
          <p className="text-sm text-yellow-200 mt-1">
            Don&apos;t show your role to other players.
          </p>
        </div>

        {/* Active Players List */}
        {alivePlayers.length > 0 && (
          <div className="bg-gray-800 p-4 rounded-lg mb-4">
            <h2 className="font-bold mb-3">Active Players ({alivePlayers.length})</h2>
            <ul className="space-y-2">
              {alivePlayers.map((p) => (
                <li key={p.id} className="bg-gray-700 p-3 rounded flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {suspiciousPlayers.has(p.id) && <span className="text-yellow-400">⭐</span>}
                    <span>{p.name}</span>
                  </div>
                  <button
                    onClick={() => toggleSuspicious(p.id)}
                    className="text-xs bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded transition-colors"
                  >
                    {suspiciousPlayers.has(p.id) ? 'Unmark' : 'Mark Suspicious'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Vote Button */}
        {player.isAlive && alivePlayers.length > 0 && (
          <div className="mb-4">
            {currentVote ? (
              <div className="bg-green-900 border-2 border-green-600 p-4 rounded text-center">
                <p className="font-bold text-green-300">You voted for {currentVote.targetName}</p>
                <button
                  onClick={() => setShowVoteModal(true)}
                  className="mt-2 text-sm bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition-colors"
                >
                  Change Vote
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowVoteModal(true)}
                className="w-full bg-red-600 hover:bg-red-700 p-4 rounded font-bold text-lg transition-colors"
              >
                {themeText.voteButton}
              </button>
            )}
          </div>
        )}

        {/* Eliminated Players List */}
        {eliminatedPlayers.length > 0 && (
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="font-bold mb-3">{themeText.eliminated} ({eliminatedPlayers.length})</h2>
            <ul className="space-y-2">
              {eliminatedPlayers.map((p) => (
                <li key={p.id} className="bg-gray-700/50 p-3 rounded opacity-70">
                  <div className="flex items-center justify-between">
                    <span className="line-through text-gray-400">{p.name}</span>
                    {p.roleData && (
                      <div className="text-right">
                        <p className="text-sm font-medium">{p.roleData.name}</p>
                        <p className={`text-xs ${
                          p.roleData.alignment === 'good' ? 'text-blue-400' :
                          p.roleData.alignment === 'evil' ? 'text-red-400' :
                          'text-purple-400'
                        }`}>
                          ({p.roleData.alignment})
                        </p>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Vote Modal */}
        {showVoteModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">{themeText.voteHeader}</h2>
              <p className="text-gray-400 mb-4 text-sm">
                Select a player to vote for elimination:
              </p>
              <select
                value={voteTarget}
                onChange={(e) => setVoteTarget(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded mb-4 text-white"
              >
                <option value="">Select a player...</option>
                {alivePlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {suspiciousPlayers.has(p.id) ? '⭐' : ''}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={submitVote}
                  disabled={!voteTarget}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-3 rounded font-bold transition-colors"
                >
                  Submit Vote
                </button>
                <button
                  onClick={() => {
                    setShowVoteModal(false);
                    setVoteTarget('');
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
