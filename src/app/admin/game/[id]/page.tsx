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
  players: Array<{
    id: string;
    name: string;
    hasRole: boolean;
  }>;
}

export default function AdminGamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const [game, setGame] = useState<Game | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);

  // Fetch game data
  const fetchGame = async () => {
    try {
      const response = await fetch(`/api/games/by-id/${gameId}`);
      if (response.ok) {
        const data = await response.json();
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
    if (game?.code) {
      const joinUrl = `${window.location.origin}/game/${game.code}`;
      QRCode.toDataURL(joinUrl, { width: 256 })
        .then(setQrCodeUrl)
        .catch(err => console.error('Error generating QR code:', err));
    }
  }, [game?.code]);

  // Poll for updates every 3 seconds
  useEffect(() => {
    fetchGame();
    const interval = setInterval(fetchGame, 3000);
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
        const error = await response.json();
        alert(error.error || 'Failed to issue cards');
      }
    } catch (error) {
      console.error('Error issuing cards:', error);
      alert('Error issuing cards');
    } finally {
      setIssuing(false);
    }
  };

  // Copy code to clipboard
  const copyCode = () => {
    if (game?.code) {
      navigator.clipboard.writeText(game.code);
      alert('Code copied to clipboard!');
    }
  };

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
        <h1 className="text-2xl font-bold mb-1">Game Master Console</h1>
        <p className="text-gray-400 mb-6 capitalize">{game.theme.replace('-', ' ')} Theme</p>

        {/* Game Code */}
        <div className="bg-gray-800 p-6 rounded-lg mb-4 text-center">
          <p className="text-sm text-gray-400 mb-2">Game Code</p>
          <p className="text-5xl font-bold tracking-widest mb-4">{game.code}</p>
          <button
            onClick={copyCode}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm transition-colors"
          >
            Copy Code
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

        {/* QR Code */}
        {qrCodeUrl && (
          <div className="bg-white p-4 rounded-lg mb-4 text-center">
            <img src={qrCodeUrl} alt="QR Code" className="mx-auto" />
            <p className="text-gray-600 text-sm mt-2">Scan to join game</p>
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
              {game.players.map((player) => (
                <li key={player.id} className="bg-gray-700 p-3 rounded flex items-center justify-between">
                  <span>{player.name}</span>
                  {player.hasRole && (
                    <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">
                      Role Assigned
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

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
          <div className="bg-green-900 border-2 border-green-600 p-4 rounded text-center">
            <p className="font-bold text-lg">Game Active!</p>
            <p className="text-sm text-green-300 mt-1">
              All players have received their roles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
