'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [theme, setTheme] = useState('classic');
  const [enableVoting, setEnableVoting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [themes, setThemes] = useState<any[]>([]);

  // Use a default player count of 12 for role distribution
  const playerCount = 12;

  // Fetch available themes
  useEffect(() => {
    fetch('/api/themes')
      .then(res => res.json())
      .then(data => {
        const typedData = data as { themes?: any[] };
        if (typedData.themes) {
          setThemes(typedData.themes);
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
        body: JSON.stringify({ theme, playerCount, enableVoting }),
      });

      if (response.ok) {
        const game = await response.json() as { id: string };
        router.push(`/admin/game/${game.id}`);
      } else {
        const error = await response.json() as { error?: string };
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
        <h1 className="text-3xl font-bold mb-2">Death Eaters Among Us</h1>
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
                  <option value="harry-potter">Harry Potter</option>
                </>
              )}
            </select>
            {themes.find(t => t.id === theme) && (
              <p className="text-xs text-gray-400 mt-1">
                Recommended: {themes.find(t => t.id === theme)?.recommendedPlayers} players
              </p>
            )}
          </div>

          {/* Enable Voting */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enableVoting}
                onChange={(e) => setEnableVoting(e.target.checked)}
                className="w-5 h-5 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-2"
              />
              <div>
                <span className="text-sm font-medium">Enable Player Voting</span>
                <p className="text-xs text-gray-400">
                  Allow players to vote for elimination during day phases
                </p>
              </div>
            </label>
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
