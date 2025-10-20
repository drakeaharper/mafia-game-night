'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

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
  }, [playerId, player?.role]);

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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-gray-400 mb-2">Your Role</p>
          <h1 className="text-4xl font-bold mb-2">{player.role.name}</h1>
          {player.isAlive ? (
            <p className="text-green-500 font-medium">● Alive</p>
          ) : (
            <p className="text-red-500 font-medium">● Eliminated</p>
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
        <div className="bg-yellow-900/50 border-2 border-yellow-600 rounded p-4 text-center">
          <p className="font-bold text-yellow-300">⚠️ Keep This Screen Secret!</p>
          <p className="text-sm text-yellow-200 mt-1">
            Don&apos;t show your role to other players.
          </p>
        </div>
      </div>
    </div>
  );
}
