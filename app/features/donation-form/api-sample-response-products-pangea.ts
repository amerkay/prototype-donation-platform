import type { Product } from '~/features/donation-form/product/types'

export const products: Product[] = [
  {
    id: 'sponsor-kariba',
    name: 'Adopt Kariba the Elephant',
    description: "Monthly sponsorship to support Kariba's retirement care and comfort",
    minPrice: 5,
    default: 15,
    frequency: 'monthly',
    image: '🐘',
    thumbnail: '🐘',
    icon: '🐘'
  },
  {
    id: 'sponsor-julie',
    name: 'Adopt Julie the Elephant',
    description: "Monthly sponsorship for Julie's ongoing care and wellbeing",
    minPrice: 5,
    default: 15,
    frequency: 'monthly',
    image: '🐘',
    thumbnail: '🐘',
    icon: '🐘'
  },
  {
    id: 'plush-toy',
    name: 'Plush Elephant Toy',
    description: 'Adorable plush elephant to support our sanctuary',
    frequency: 'once',
    image: '🐘',
    thumbnail: '🐘',
    icon: '🐘',
    isReward: true,
    isShippingRequired: true,
    rewardThreshold: { monthly: 25, yearly: 200 }
  },
  // {
  //   id: 'sponsor-kit',
  //   name: 'Sponsorship Welcome Kit',
  //   description: 'Certificate, photo, and updates about your sponsored elephant',
  //   frequency: 'once',
  //   image: '📦',
  //   thumbnail: '📦',
  //   icon: '📦',
  //   isReward: true,
  //   isShippingRequired: true,
  //   rewardThreshold: { monthly: 15, yearly: 100 }
  // },
  {
    id: 'enrichment-fund',
    name: 'Enrichment Activities Fund',
    description: 'Support special activities and toys for our elderly elephants',
    price: 40,
    frequency: 'once',
    image: '🎯',
    thumbnail: '🎯',
    icon: '🎯'
  },
  {
    id: 'veterinary-care',
    name: 'Support Veterinary Care',
    description: 'Monthly contribution to specialized elder elephant healthcare',
    minPrice: 10,
    default: 30,
    frequency: 'monthly',
    image: '⚕️',
    thumbnail: '⚕️',
    icon: '⚕️'
  }
]
