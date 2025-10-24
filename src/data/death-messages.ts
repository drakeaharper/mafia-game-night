/**
 * Theme-specific death messages for game announcements
 * Each theme has its own collection of whimsical elimination messages
 */

export const deathMessagesByTheme = {
  classic: [
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
  ],

  "harry-potter": [
    "was sent to Azkaban for unauthorized use of magic",
    "was caught selling Fanged Frisbees to first-years",
    "was caught performing illegal Transfiguration",
    "was arrested for operating an unlicensed Floo Network connection",
    "was arrested for breaking the Statute of Secrecy",
    "was caught bewitching Muggle artifacts for profit",
    "violated the Decree for Reasonable Restriction of Underage Sorcery",
    "was caught with an unregistered Portkey",
    "was caught running an illegal Butterbeer speakeasy",
    "was sentenced to Azkaban for brewing illegal potions",
    "got caught jinxing the wrong wizard",
    "was arrested for smuggling Venomous Tentacula seeds",
    "was found guilty by the Wizengamot for using an Unforgivable Curse",
    "was caught operating an unlicensed Apparition service",
    "got a little too creative with Memory Charms",
    "was arrested for attempting to break into Gringotts",
    "violated the Ban on Experimental Breeding",
    "was caught smuggling Dark artifacts",
    "was arrested for illegal dragon egg trafficking",
    "was detained for Improper Use of Magic",
    "got caught with a cursed object they shouldn't have",
    "was caught forging Ministry documents",
    "was caught enchanting Muggle money",
    "was arrested for illegally importing Flying Carpets",
    "was caught performing Dark magic in Knockturn Alley",
    "was caught brewing Felix Felicis without a license",
    "violated International Statute of Wizarding Secrecy",
    "was caught hexing Muggles",
    "was arrested for running an illegal Pygmy Puff fighting ring",
    "was arrested for illegal Apparition",
    "got caught tampering with a Time-Turner",
    "was caught selling fake love potions to students",
    "was detained for suspicious wand activity",
    "was caught operating an underground Quidditch betting ring",
    "was caught with an illegal breeding program for Blast-Ended Skrewts",
    "got arrested after failing to register as an Animagus",
    "was caught stealing ingredients from Snape's private stores",
    "violated the Code of Wand Use",
    "was arrested for enchanting a Muggle vehicle to fly",
    "was caught red-handed with stolen Gillyweed",
  ],

  werewolf: [
    "was torn apart by werewolves in the night",
    "didn't survive the full moon",
    "was found mauled in the village square",
    "heard howling... and then silence",
    "became the wolves' midnight snack",
    "was dragged into the dark forest",
    "fell victim to the pack's hunger",
    "didn't make it back before dawn",
    "was hunted down by moonlight",
    "met the alpha's fangs",
    "was caught outside after curfew",
    "became part of the wolves' feeding frenzy",
    "didn't heed the warning howls",
    "was turned into werewolf chow",
    "met a grisly fate under the full moon",
    "was overwhelmed by the pack",
    "left only claw marks behind",
    "was devoured by creatures of the night",
    "fell to the curse of lycanthropy",
    "became a cautionary tale for villagers",
    "was silenced by the wolves' bite",
    "didn't make it to sunrise",
    "was hunted down like prey",
    "met the beast in human form",
    "fell victim to silver-proof claws",
    "was eliminated from the gene pool",
    "heard their death knell in a howl",
    "was caught in the werewolves' territory",
    "didn't survive the night's rampage",
    "became a tragic statistic",
    "was ripped apart by supernatural forces",
    "fell to the curse of the moon",
    "met their end in tooth and claw",
    "was hunted by the infected",
    "didn't escape the pack's wrath",
    "was consumed by primal hunger",
    "fell victim to the village's curse",
    "met a savage end",
    "was claimed by the beasts",
    "perished in the wolves' domain",
  ],
};

/**
 * Get a random death message for a specific theme
 */
export function getRandomDeathMessage(theme: string = "classic"): string {
  const messages = deathMessagesByTheme[theme as keyof typeof deathMessagesByTheme] || deathMessagesByTheme.classic;
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
}

/**
 * Get all death messages for a theme
 */
export function getAllDeathMessages(theme: string = "classic"): string[] {
  const messages = deathMessagesByTheme[theme as keyof typeof deathMessagesByTheme] || deathMessagesByTheme.classic;
  return [...messages];
}

/**
 * Get available themes
 */
export function getAvailableThemes(): string[] {
  return Object.keys(deathMessagesByTheme);
}
