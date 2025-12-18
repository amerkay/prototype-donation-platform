import type { Product } from '@/lib/common/types'

export const products: Product[] = [
  {
    id: 'adopt-bumi',
    name: 'Adopt Bumi the Orangutan',
    description: "Monthly sponsorship to support Bumi's care and rehabilitation",
    minPrice: 3,
    default: 10,
    frequency: 'monthly',
    image: '🦧',
    thumbnail: '🦧',
    icon: '🦧'
  },
  {
    id: 'adopt-maya',
    name: 'Adopt Maya the Orangutan',
    description: "Monthly sponsorship for Maya's ongoing medical care",
    minPrice: 3,
    default: 10,
    frequency: 'monthly',
    image: '🦧',
    thumbnail: '🦧',
    icon: '🦧'
  },
  {
    id: 'plush-toy',
    name: 'Plush Baby Orangutan Toy',
    description: 'Adorable plush toy to support our mission',
    frequency: 'once',
    image: '🧸',
    thumbnail: '🧸',
    icon: '🧸',
    isReward: true,
    isShippingRequired: true,
    rewardThreshold: { monthly: 25, yearly: 200 }
  },
  {
    id: 'adopt-kit',
    name: 'Adoption Welcome Kit',
    description: 'Certificate, photo, and updates about your adopted orangutan',
    frequency: 'once',
    image: '📦',
    thumbnail: '📦',
    icon: '📦',
    isReward: true,
    isShippingRequired: true,
    rewardThreshold: { monthly: 10, yearly: 75 }
  },
  {
    id: 'tree-planting',
    name: 'Plant 10 Trees',
    description: 'Help restore orangutan habitat with native tree planting',
    price: 30,
    frequency: 'once',
    image: '🌳',
    thumbnail: '🌳',
    icon: '🌳'
  },
  {
    id: 'education-program',
    name: 'Support Education Program',
    description: 'Monthly contribution to local conservation education',
    minPrice: 5,
    default: 25,
    frequency: 'monthly',
    image: '📚',
    thumbnail: '📚',
    icon: '📚'
  }
]
