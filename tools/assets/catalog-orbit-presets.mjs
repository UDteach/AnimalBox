import path from 'node:path';

const orbitPrefixes = [
  'gleam',
  'maple',
  'meadowbright',
  'snowcap',
  'blueberry',
  'amber',
  'mintleaf',
  'rosehip',
  'silverdew',
  'duskglow',
  'cedar',
  'apricot',
  'lotus',
  'pebblebrook',
  'honeyfern',
  'violet'
];

const decorSuffixBatches = [
  [
    'cork-loveseat',
    'felt-drum',
    'cloud-wardrobe',
    'button-spring',
    'petal-lounger',
    'acorn-sconce',
    'clover-mat',
    'yarn-viaduct',
    'moss-cabinet',
    'shell-washbowl',
    'thread-portico',
    'pebble-bistro',
    'seed-bassinet',
    'honey-trellis',
    'felt-cubby',
    'mushroom-nest'
  ],
  [
    'tea-settee',
    'cookie-hearth',
    'dew-porthole',
    'yarn-swing',
    'acorn-cupboard',
    'clover-beacon',
    'berry-writing-desk',
    'cork-spout',
    'cloud-hideout',
    'button-picket',
    'linen-hutch',
    'thread-ladder',
    'moon-den',
    'seed-counter',
    'honey-perch',
    'fern-walkway'
  ],
  [
    'felt-cot',
    'acorn-lookout',
    'petal-glow-lamp',
    'cloud-divan',
    'cookie-trolley',
    'mushroom-bookcase',
    'rain-bowl',
    'clover-pavilion',
    'seed-banister',
    'cork-armoire',
    'honey-mat',
    'yarn-garden-door',
    'fern-spring',
    'button-seat',
    'moon-porthole',
    'thread-gatehouse'
  ],
  [
    'berry-sideboard',
    'cloud-bassinet',
    'cork-overpass',
    'honey-ottoman',
    'moon-vanity',
    'felt-pump',
    'acorn-canopy',
    'petal-cot',
    'clover-entry',
    'yarn-rocker',
    'seed-palisade',
    'cookie-bistro',
    'mushroom-sconce',
    'rain-washstand',
    'thread-sling',
    'pebble-lookout'
  ],
  [
    'button-pavilion',
    'honey-washbowl',
    'fern-loveseat',
    'felt-locker',
    'cork-nightlight',
    'cloud-settee',
    'moon-gateway',
    'seed-cabinet',
    'petal-runner',
    'clover-steps',
    'yarn-spooler',
    'acorn-porthole',
    'cookie-armchair',
    'mushroom-bassinet',
    'rain-spring',
    'honey-daybed'
  ]
];

const floatingSuffixBatches = [
  [
    'mote',
    'pearllet',
    'wisp',
    'glimmer',
    'bubblelet',
    'threadlet',
    'spark',
    'cloudlet',
    'moonlet',
    'orb',
    'buttonlet',
    'teardrop',
    'starlet',
    'corklet',
    'ribbonlet',
    'glowlet'
  ],
  [
    'dewdrop',
    'bobble',
    'ringlet',
    'sparklet',
    'pearl',
    'seedlet',
    'loop',
    'featherlet',
    'glint',
    'comet',
    'moonseed',
    'belllet',
    'cork',
    'button',
    'wisp',
    'threadlet'
  ],
  [
    'cookielet',
    'mote',
    'orb',
    'ribbon',
    'thread',
    'biscuit',
    'daisy',
    'bobbin',
    'cloud',
    'sparklet',
    'ring',
    'seed',
    'glow',
    'pearl',
    'buttonlet',
    'moonlet'
  ]
];

const wardrobeSuffixes = [
  'beret',
  'collar',
  'capelet',
  'monocle',
  'hoodie',
  'pouch',
  'bib',
  'hat',
  'scarf',
  'vest',
  'earwrap',
  'kerchief',
  'backpack',
  'wool-bow',
  'bonnet',
  'poncho'
];

const animalPoseItems = [
  'pose-gleam-curl',
  'pose-maple-wave',
  'pose-meadowbright-pounce',
  'pose-snowcap-guard',
  'pose-blueberry-nap',
  'pose-amber-sit',
  'pose-mintleaf-peek',
  'pose-rosehip-sniff',
  'gleam-dormouse',
  'maple-gerbil',
  'meadowbright-harvest-mouse',
  'snowcap-chinchilla',
  'amber-marmot',
  'silverdew-mouse',
  'pebblebrook-pika',
  'violet-vole'
];

function idsFromSuffixes(suffixes) {
  return suffixes.map((suffix, index) => `${orbitPrefixes[index]}-${suffix}`);
}

function decorPreset(batch, suffixes) {
  return [
    `decor-batch-${batch}`,
    {
      sourceDir: path.join('assets', 'source', 'imagegen', `decor-batch-${batch}`),
      sourceName: `decor-batch-${batch}__source.png`,
      runtimeDir: path.join('public', 'images', 'runtime', 'decor', `batch-${batch}`),
      items: idsFromSuffixes(suffixes)
    }
  ];
}

function floatingPreset(pack, suffixes) {
  return [
    `floating-items-pack-${pack}`,
    {
      sourceDir: path.join('assets', 'source', 'imagegen', 'floating-items'),
      sourceName: `floating-items-pack-${pack}__source.png`,
      runtimeDir: path.join('public', 'images', 'runtime', 'floating-items', `pack-${pack}`),
      items: idsFromSuffixes(suffixes)
    }
  ];
}

export const catalogOrbitPresets = {
  ...Object.fromEntries(decorSuffixBatches.map((suffixes, index) => decorPreset(String(57 + index).padStart(3, '0'), suffixes))),
  ...Object.fromEntries(floatingSuffixBatches.map((suffixes, index) => floatingPreset(String(36 + index).padStart(3, '0'), suffixes))),
  'wardrobe-batch-015': {
    sourceDir: path.join('assets', 'source', 'imagegen', 'wardrobe-batch-015'),
    sourceName: 'wardrobe-batch-015__source.png',
    runtimeDir: path.join('public', 'images', 'runtime', 'wardrobe', 'batch-015'),
    items: idsFromSuffixes(wardrobeSuffixes)
  },
  'animal-pose-pack-013': {
    sourceDir: path.join('assets', 'source', 'imagegen', 'animal-pose-pack-013'),
    sourceName: 'animal-pose-pack-013__source.png',
    runtimeDir: path.join('public', 'images', 'runtime', 'characters', 'animals', 'batch-013'),
    items: animalPoseItems
  }
};
