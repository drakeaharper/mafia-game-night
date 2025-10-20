'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [theme, setTheme] = useState('classic');
  const [playerCount, setPlayerCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [themes, setThemes] = useState<any[]>([]);

  // Fetch available themes
  useEffect(() => {
    fetch('/api/themes')
      .then(res => res.json())
      .then(data => {
        if (data.themes) {
          setThemes(data.themes);
        }
      })
      .catch(err => console.error('Error fetching themes:', err));
  }, []);

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
        const error = await response.json();
        alert(error.error || 'Failed to create game');
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
        <h1 className="text-3xl font-bold mb-2">Mafia Game Night</h1>
        <p className="text-gray-400 mb-8">Game Master Console</p>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Create New Game</h2>

          {/* Theme Selection */}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-red-500 focus:outline-none"
            >
              {themes.length > 0 ? (
                themes.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name || t.id}
                  </option>
                ))
              ) : (
                <>
                  <option value="classic">Classic Mafia</option>
                  <option value="harry-potter">Death Eaters Among Us</option>
                </>
              )}
            </select>
            {themes.find(t => t.id === theme) && (
              <p className="text-xs text-gray-400 mt-1">
                Recommended: {themes.find(t => t.id === theme)?.recommendedPlayers} players
              </p>
            )}
          </div>

          {/* Player Count */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium">Player Count</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="7"
                max="20"
                value={playerCount}
                onChange={(e) => setPlayerCount(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-2xl font-bold w-12 text-center">{playerCount}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Minimum 7 players required
            </p>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateGame}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 p-4 rounded font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating Game...' : 'Create Game'}
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>You&apos;ll receive a game code to share with players</p>
        </div>
      </div>
    </div>
  );
}
