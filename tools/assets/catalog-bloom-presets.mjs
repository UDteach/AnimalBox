import path from 'node:path';

const bloomPrefixes = [
  'aurora',
  'brickberry',
  'clovermist',
  'daffodil',
  'elderleaf',
  'frostmint',
  'gingerroot',
  'hazelwood',
  'ivorybell',
  'juniper',
  'kiwibud',
  'lavenderbud',
  'mariglow',
  'nightbloom',
  'oliveleaf',
  'poppyseed'
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
  ],
  [
    'cork-tea-cart',
    'felt-garden-seat',
    'cloud-vanity',
    'button-birdbath',
    'petal-reading-nook',
    'acorn-music-box',
    'clover-patch-rug',
    'yarn-covered-bridge',
    'moss-toy-chest',
    'shell-lily-basin',
    'thread-secret-door',
    'pebble-porch-table',
    'seed-lullaby-cradle',
    'honey-flower-arch',
    'felt-display-shelf',
    'mushroom-canopy-bed'
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
  'pose-aurora-curl',
  'pose-brickberry-wave',
  'pose-clovermist-pounce',
  'pose-daffodil-guard',
  'pose-elderleaf-nap',
  'pose-frostmint-sit',
  'pose-gingerroot-peek',
  'pose-hazelwood-sniff',
  'aurora-dormouse',
  'brickberry-gerbil',
  'clovermist-harvest-mouse',
  'daffodil-chinchilla',
  'elderleaf-marmot',
  'frostmint-mouse',
  'gingerroot-pika',
  'hazelwood-vole'
];

function idsFromSuffixes(suffixes) {
  return suffixes.map((suffix, index) => `${bloomPrefixes[index]}-${suffix}`);
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

export const catalogBloomPresets = {
  ...Object.fromEntries(decorSuffixBatches.map((suffixes, index) => decorPreset(String(62 + index).padStart(3, '0'), suffixes))),
  ...Object.fromEntries(floatingSuffixBatches.map((suffixes, index) => floatingPreset(String(39 + index).padStart(3, '0'), suffixes))),
  'wardrobe-batch-016': {
    sourceDir: path.join('assets', 'source', 'imagegen', 'wardrobe-batch-016'),
    sourceName: 'wardrobe-batch-016__source.png',
    runtimeDir: path.join('public', 'images', 'runtime', 'wardrobe', 'batch-016'),
    items: idsFromSuffixes(wardrobeSuffixes)
  },
  'animal-pose-pack-014': {
    sourceDir: path.join('assets', 'source', 'imagegen', 'animal-pose-pack-014'),
    sourceName: 'animal-pose-pack-014__source.png',
    runtimeDir: path.join('public', 'images', 'runtime', 'characters', 'animals', 'batch-014'),
    items: animalPoseItems
  }
};
