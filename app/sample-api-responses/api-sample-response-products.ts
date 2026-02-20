import type { Product } from '~/features/donation-form/features/product/shared/types'

// --- Donation products (adopt-orangutan campaign) ---

export const products: Product[] = [
  {
    id: 'adopt-bumi',
    name: 'Adopt Bumi',
    title: 'Adopt Bumi the Rescued Baby',
    description: "Support Bumi's care, rehab, and release to the wild.", // 52 chars
    minPrice: 3,
    default: 10,
    frequency: 'monthly',
    image: '/imgs/orangutan-images/baimah.jpg',
    certificateTemplateId: 'cert-adoption',
    certificateTitle: 'Thank you for adopting Bumi!', // 39 chars
    certificateText:
      'Your adoption helps provide daily food, medical care, and rehabilitation support for Bumi as he learns the skills needed to return to the wild. Every contribution helps us protect endangered orangutans and preserve their rainforest home.' // 240 chars
  },
  {
    id: 'adopt-maya',
    name: 'Adopt Maya',
    title: 'Adopt Maya the Survivor',
    description: "Fund Maya's rehabilitation journey!", // 52 chars
    minPrice: 3,
    default: 10,
    frequency: 'monthly',
    image: '/imgs/orangutan-images/jeni.jpg',
    certificateTemplateId: 'cert-adoption',
    certificateTitle: 'Maya',
    certificateText:
      'Maya requires specialized medical care due to injuries from the illegal pet trade. Your support ensures she receives the treatment she needs and helps fund her path to recovery and eventual release.' // 199 chars
  },
  {
    id: 'tree-planting',
    name: 'Tree Planting',
    title: 'Plant 10 Native Rainforest Trees for Wildlife',
    description: 'Plant native trees to restore orangutan habitat.', // 48 chars
    price: 30,
    frequency: 'once',
    image: null
  },
  {
    id: 'education-program',
    name: 'Education Program',
    title: 'Support Local Conservation Education Program',
    description: 'Fund conservation education in local communities.', // 49 chars
    minPrice: 5,
    default: 25,
    frequency: 'monthly',
    image: null,
    certificateText:
      'Your support funds conservation education programs that teach local communities sustainable practices and inspire the next generation of wildlife protectors.'
  }
]

// --- Stall booking products (registration) ---

export const stallBookingProducts: Product[] = [
  {
    id: 'stall-standard',
    name: 'Standard Stall',
    title: 'Standard Stall (3m x 3m)',
    description: 'Indoor stall with table and two chairs.',
    price: 25,
    frequency: 'once',
    image: null
  },
  {
    id: 'stall-large',
    name: 'Large Stall',
    title: 'Large Stall (3m x 6m)',
    description: 'Double-width stall with extra display space.',
    price: 45,
    frequency: 'once',
    image: null
  },
  {
    id: 'stall-corner',
    name: 'Corner Stall',
    title: 'Corner Stall (3m x 3m)',
    description: 'Prime corner position with two open sides.',
    price: 35,
    frequency: 'once',
    image: null
  }
]

// --- Dog show products (ticketing, £2.50 per category) ---

export const dogShowProducts: Product[] = [
  {
    id: 'dog-top-survivor',
    name: 'Top Survivor',
    title: 'Top Survivor',
    description: 'For rescue dogs who have overcome adversity.',
    price: 2.5,
    frequency: 'once',
    image: null
  },
  {
    id: 'dog-cutest-puppy',
    name: 'Cutest Puppy',
    title: 'Cutest Puppy',
    description: 'Puppies under 12 months — cutest face wins!',
    price: 2.5,
    frequency: 'once',
    image: null
  },
  {
    id: 'dog-best-in-show',
    name: 'Best in Show',
    title: 'Best in Show',
    description: 'Overall champion judged on appearance and temperament.',
    price: 2.5,
    frequency: 'once',
    image: null
  },
  {
    id: 'dog-waggiest-tail',
    name: 'Waggiest Tail',
    title: 'Waggiest Tail',
    description: 'The happiest tail wins the prize!',
    price: 2.5,
    frequency: 'once',
    image: null
  },
  {
    id: 'dog-best-trick',
    name: 'Best Trick',
    title: 'Best Trick',
    description: "Show off your dog's best party trick.",
    price: 2.5,
    frequency: 'once',
    image: null
  },
  {
    id: 'dog-golden-oldie',
    name: 'Golden Oldie',
    title: 'Golden Oldie',
    description: 'Veteran dogs aged 8 and over.',
    price: 2.5,
    frequency: 'once',
    image: null
  }
]

// --- Classic car show products (registration, free) ---

export const classicCarProducts: Product[] = [
  {
    id: 'classic-car-entry',
    name: 'Classic Car Entry',
    title: 'Classic Car Entry',
    description: 'Register your classic car for the show.',
    price: 0,
    frequency: 'once',
    image: null
  }
]
