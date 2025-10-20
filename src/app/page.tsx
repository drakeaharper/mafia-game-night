'use client';

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6">Mafia Game Night</h1>
        <p className="text-xl text-gray-400 mb-12">
          Digital companion for managing in-person Mafia/Werewolf games
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/admin"
            className="bg-red-600 hover:bg-red-700 p-6 rounded-lg font-bold text-lg transition-colors"
          >
            Game Master
            <p className="text-sm font-normal mt-2 text-gray-200">
              Create and manage games
            </p>
          </Link>

          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="font-bold text-lg mb-2">Join a Game</p>
            <p className="text-sm text-gray-400 mb-4">
              Enter the game code provided by your Game Master
            </p>
            <input
              type="text"
              placeholder="Enter game code"
              className="w-full p-3 bg-gray-700 rounded text-center uppercase tracking-widest"
              maxLength={6}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const input = e.currentTarget;
                  if (input.value.trim()) {
                    window.location.href = `/game/${input.value.toUpperCase()}`;
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>Support for Classic Mafia and themed variants</p>
        </div>
      </div>
    </div>
  );
}
