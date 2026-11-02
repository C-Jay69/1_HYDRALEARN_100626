/**
 * Definition Derby (Classroom Edition)
 * Stimulus cards for a Balderdash-style classroom gameshow.
 *
 * Each card shows a prompt to the class and keeps the real answer for the host.
 * Definitions are written to be accurate; the "Word" category follows the
 * sample cards in the original game design document.
 */

export const DERBY_CATEGORIES = [
  'Word',
  'Person',
  'Law / Principle',
  'Acronym',
  'Movie',
  'All About',
] as const;

export type DerbyCategory = (typeof DERBY_CATEGORIES)[number];

export type CategoryFilter = 'All' | DerbyCategory;

export interface StimulusCard {
  id: string;
  category: DerbyCategory;
  /** What the host reads aloud / shows the class. */
  prompt: string;
  /** The real answer, kept by the host until the reveal. */
  realAnswer: string;
}

export const DERBY_CARDS: StimulusCard[] = [
  // ---------------------------------------------------------------- Word
  {
    id: 'word-accidie',
    category: 'Word',
    prompt: '“Accidie”',
    realAnswer:
      'A state of spiritual or mental listlessness; apathy. An old term for the “noonday demon” of sloth.',
  },
  {
    id: 'word-bibliognost',
    category: 'Word',
    prompt: '“Bibliognost”',
    realAnswer:
      'A person who knows about books — someone with deep, often bibliophilic knowledge of books and bibliography.',
  },
  {
    id: 'word-ultracrepidarian',
    category: 'Word',
    prompt: '“Ultracrepidarian”',
    realAnswer:
      'A person who gives opinions on subjects beyond their knowledge or expertise. From Latin for “beyond the sole” of a shoe.',
  },
  {
    id: 'word-borborygmus',
    category: 'Word',
    prompt: '“Borborygmus”',
    realAnswer:
      'The rumbling sound made by gas moving through the intestines. Its plural is “borborygmi.”',
  },
  {
    id: 'word-pandiculation',
    category: 'Word',
    prompt: '“Pandiculation”',
    realAnswer:
      'The act of stretching and yawning at the same time, especially on waking or after sitting for a long time.',
  },
  {
    id: 'word-erinaceous',
    category: 'Word',
    prompt: '“Erinaceous”',
    realAnswer: 'Relating to or resembling a hedgehog.',
  },
  {
    id: 'word-snollygoster',
    category: 'Word',
    prompt: '“Snollygoster”',
    realAnswer:
      'A shrewd, unprincipled person — especially a politician who puts personal gain above principles.',
  },
  {
    id: 'word-mumpsimus',
    category: 'Word',
    prompt: '“Mumpsimus”',
    realAnswer:
      'A person who obstinately clings to a wrong belief or practice, or the erroneous belief itself.',
  },
  {
    id: 'word-nudiustertian',
    category: 'Word',
    prompt: '“Nudiustertian”',
    realAnswer: 'Relating to the day before yesterday.',
  },
  {
    id: 'word-garrulity',
    category: 'Word',
    prompt: '“Garrulity”',
    realAnswer: 'Excessive talkativeness; the quality of being garrulous.',
  },
  {
    id: 'word-obnubilate',
    category: 'Word',
    prompt: '“Obnubilate”',
    realAnswer: 'To cloud over, darken, or obscure — literally or figuratively.',
  },
  {
    id: 'word-sciolist',
    category: 'Word',
    prompt: '“Sciolist”',
    realAnswer:
      'A person who has only superficial knowledge but pretends to be learned; a pretender to knowledge.',
  },

  // -------------------------------------------------------------- Person
  {
    id: 'person-constantia',
    category: 'Person',
    prompt: 'Who was Flavia Julia Constantia?',
    realAnswer:
      'A 4th-century Roman noblewoman, daughter of Constantius Chlorus and half-sister of Constantine the Great. She later became empress as the wife of Licinius.',
  },
  {
    id: 'person-semmelweis',
    category: 'Person',
    prompt: 'Who was Ignaz Semmelweis?',
    realAnswer:
      'A 19th-century Hungarian physician who discovered that handwashing with chlorinated lime reduced childbed fever. His findings were widely rejected during his lifetime.',
  },
  {
    id: 'person-lamarr',
    category: 'Person',
    prompt: 'Who was Hedy Lamarr?',
    realAnswer:
      'An Austrian-American actress and inventor who co-developed a frequency-hopping spread-spectrum system intended to make radio-guided torpedoes harder to jam.',
  },
  {
    id: 'person-cugnot',
    category: 'Person',
    prompt: 'Who was Nicolas-Joseph Cugnot?',
    realAnswer:
      'An 18th-century French inventor who built one of the first self-propelled steam vehicles — a steam tricycle — around 1770.',
  },
  {
    id: 'person-hatshepsut',
    category: 'Person',
    prompt: 'Who was Hatshepsut?',
    realAnswer:
      'A female pharaoh of ancient Egypt’s 18th Dynasty who ruled in the 15th century BCE and was often depicted with royal regalia and a ceremonial false beard.',
  },

  // ---------------------------------------------------- Law / Principle
  {
    id: 'law-benford',
    category: 'Law / Principle',
    prompt: 'What is Benford’s Law?',
    realAnswer:
      'The observation that in many naturally occurring data sets, leading digits are not evenly distributed: 1 occurs about 30% of the time, and higher digits occur progressively less often.',
  },
  {
    id: 'law-zipf',
    category: 'Law / Principle',
    prompt: 'What is Zipf’s Law?',
    realAnswer:
      'The observation that in natural language a word’s frequency is roughly inversely proportional to its rank — the most common word appears about twice as often as the second, three times as often as the third, and so on.',
  },
  {
    id: 'law-sturgeon',
    category: 'Law / Principle',
    prompt: 'What is Sturgeon’s Law?',
    realAnswer:
      'Science-fiction writer Theodore Sturgeon’s observation that “ninety percent of everything is crap” — most of any field’s output is mediocre, while a small fraction is excellent.',
  },
  {
    id: 'law-hanlon',
    category: 'Law / Principle',
    prompt: 'What is Hanlon’s Razor?',
    realAnswer:
      'The principle that one should not attribute to malice what can be adequately explained by carelessness or misunderstanding. Popularly attributed to Robert J. Hanlon.',
  },
  {
    id: 'law-parkinson',
    category: 'Law / Principle',
    prompt: 'What is Parkinson’s Law?',
    realAnswer:
      'C. Northcote Parkinson’s observation that work expands to fill the time available for its completion.',
  },
  {
    id: 'law-goodhart',
    category: 'Law / Principle',
    prompt: 'What is Goodhart’s Law?',
    realAnswer:
      'The principle that when a measure becomes a target, it ceases to be a good measure. Originally formulated in economics about monetary indicators.',
  },

  // -------------------------------------------------------------- Acronym
  {
    id: 'acronym-taser',
    category: 'Acronym',
    prompt: 'What does “TASER” stand for?',
    realAnswer:
      'Thomas A. Swift’s Electric Rifle — named after a fictional boy inventor from early 20th-century adventure novels.',
  },
  {
    id: 'acronym-scuba',
    category: 'Acronym',
    prompt: 'What does “SCUBA” stand for?',
    realAnswer: 'Self-Contained Underwater Breathing Apparatus.',
  },
  {
    id: 'acronym-snafu',
    category: 'Acronym',
    prompt: 'What does “SNAFU” stand for?',
    realAnswer:
      'Situation Normal: All Fouled Up — a sanitized version of the original military slang acronym.',
  },
  {
    id: 'acronym-nimby',
    category: 'Acronym',
    prompt: 'What does “NIMBY” stand for?',
    realAnswer:
      'Not In My Back Yard — opposition by residents to a proposed development in their local area.',
  },
  {
    id: 'acronym-captcha',
    category: 'Acronym',
    prompt: 'What does “CAPTCHA” stand for?',
    realAnswer:
      'Completely Automated Public Turing test to tell Computers and Humans Apart.',
  },
  {
    id: 'acronym-smart',
    category: 'Acronym',
    prompt: 'What does “SMART” stand for in SMART goals?',
    realAnswer:
      'Specific, Measurable, Achievable, Relevant, and Time-bound — a common framework for setting goals.',
  },

  // ---------------------------------------------------------------- Movie
  {
    id: 'movie-red-balloon',
    category: 'Movie',
    prompt: 'What is the plot of “The Red Balloon” (1956)?',
    realAnswer:
      'A French short film about a young boy in Paris who befriends a red balloon that seems to follow him around the city. The balloon becomes his companion until a gang of boys destroys it.',
  },
  {
    id: 'movie-la-jetee',
    category: 'Movie',
    prompt: 'What is the plot of “La Jetée” (1962)?',
    realAnswer:
      'A French science-fiction short made almost entirely of still photographs. After a nuclear war, a man is sent through time to help save humanity, and he discovers that a childhood memory is tied to his own death.',
  },
  {
    id: 'movie-meshes',
    category: 'Movie',
    prompt: 'What is the plot of “Meshes of the Afternoon” (1943)?',
    realAnswer:
      'An experimental silent short by Maya Deren and Alexander Hammid. A woman moves through a dreamlike, repeating cycle in and around a house, following a hooded figure with a mirror for a face.',
  },
  {
    id: 'movie-bicycle-thieves',
    category: 'Movie',
    prompt: 'What is the plot of “Bicycle Thieves” (1948)?',
    realAnswer:
      'An Italian neorealist film by Vittorio De Sica. A poor father and his young son search postwar Rome for the bicycle he needs for a job, after it is stolen.',
  },
  {
    id: 'movie-metropolis',
    category: 'Movie',
    prompt: 'What is the plot of “Metropolis” (1927)?',
    realAnswer:
      'A German Expressionist science-fiction film by Fritz Lang. In a futuristic city, workers toil underground while the wealthy live above, and a robot is created in the likeness of a woman to manipulate the workers.',
  },
  {
    id: 'movie-the-general',
    category: 'Movie',
    prompt: 'What is the plot of “The General” (1926)?',
    realAnswer:
      'A silent comedy starring Buster Keaton as a Southern train engineer who chases his stolen locomotive — with a woman aboard — during the American Civil War.',
  },

  // ------------------------------------------------------------ All About
  {
    id: 'about-photosynthesis',
    category: 'All About',
    prompt: 'What is photosynthesis?',
    realAnswer:
      'The process by which green plants, algae, and some bacteria use sunlight, water, and carbon dioxide to produce glucose and oxygen.',
  },
  {
    id: 'about-iambic-pentameter',
    category: 'All About',
    prompt: 'What is iambic pentameter?',
    realAnswer:
      'A poetic meter consisting of five iambic feet per line — five pairs of unstressed-then-stressed syllables.',
  },
  {
    id: 'about-filibuster',
    category: 'All About',
    prompt: 'What is a filibuster?',
    realAnswer:
      'A prolonged speech or series of speeches used in a legislature to delay or prevent a vote on a bill.',
  },
  {
    id: 'about-opportunity-cost',
    category: 'All About',
    prompt: 'What is opportunity cost?',
    realAnswer:
      'The value of the next-best alternative you give up when you make a choice.',
  },
  {
    id: 'about-continental-drift',
    category: 'All About',
    prompt: 'What is continental drift?',
    realAnswer:
      'The gradual movement of Earth’s continents relative to one another over geological time, driven by plate tectonics.',
  },
  {
    id: 'about-mitosis',
    category: 'All About',
    prompt: 'What is mitosis?',
    realAnswer:
      'A type of cell division that produces two genetically identical daughter cells, used for growth and repair.',
  },
];
