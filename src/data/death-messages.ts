/**
 * Whimsical death messages for the base Mafia game
 * These can be used by the Game Master to announce eliminations
 */

export const deathMessages = [
  "was found sleeping with the fishes",
  "took an unexpected swim in cement shoes",
  "had an unfortunate accident with a piano falling from the sky",
  "was last seen entering a very suspicious warehouse",
  "mysteriously vanished after accepting a 'business proposal'",
  "went for a one-way ride in a black sedan",
  "fell victim to a poisoned cannoli",
  "was 'convinced' to retire permanently",
  "had a disagreement with gravity... gravity won",
  "received an offer they couldn't refuse... or survive",
  "was found reenacting a scene from The Godfather... too accurately",
  "discovered the hard way that snitches get stitches",
  "went to make a phone call and never came back",
  "was caught counting cards at the wrong table",
  "had an allergic reaction to lead",
  "was voted 'Most Likely to Disappear' and took it literally",
  "forgot the password to stay alive",
  "was deleted from the server of life",
  "experienced a fatal error 404: Life Not Found",
  "ran out of health potions",
  "was eliminated by friendly fire (it wasn't friendly)",
  "fell into a plot hole and never climbed out",
  "was written out of the story arc",
  "got caught monologuing at the wrong moment",
  "discovered that curiosity doesn't just kill cats",
  "forgot to check behind the door",
  "walked into the wrong neighborhood",
  "tried to negotiate with the Mafia... unsuccessfully",
  "was made an example of",
  "got lost on the way to morning coffee... permanently",
  "was last seen saying 'What could possibly go wrong?'",
  "failed the vibe check",
  "discovered that karma works overnight delivery",
  "was unsubscribed from life",
  "got booted from the server",
  "had their plot armor revoked",
  "was given a permanent timeout",
  "rage quit... life",
  "got permabanned from existence",
  "disconnected from the mortal realm",
];

/**
 * Get a random death message
 */
export function getRandomDeathMessage(): string {
  const index = Math.floor(Math.random() * deathMessages.length);
  return deathMessages[index];
}

/**
 * Get all death messages
 */
export function getAllDeathMessages(): string[] {
  return [...deathMessages];
}
