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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Mafia Game Night</h1>
          <p className="text-gray-400">Join Game</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg mb-4">
          <p className="text-sm text-gray-400 mb-2 text-center">Game Code</p>
          <p className="text-4xl font-bold text-center tracking-widest mb-6">{gameCode}</p>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-4 bg-gray-700 rounded text-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                maxLength={20}
                required
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-1">
                This is how you&apos;ll appear to other players
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full bg-red-600 hover:bg-red-700 p-4 rounded font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Joining...' : 'Join Game'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500">
          You&apos;ll receive a role card once the game starts
        </p>
      </div>
    </div>
  );
}
