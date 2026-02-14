import type { Product } from '~/features/donation-form/features/product/shared/types'

export const products: Product[] = [
  {
    id: 'adopt-bumi',
    name: 'Adopt Bumi the Rescued Baby Orangutan Today', // 46 chars
    description: "Support Bumi's care, rehab, and release to the wild.", // 52 chars
    minPrice: 3,
    default: 10,
    frequency: 'monthly',
    image: '/imgs/orangutan-images/baimah.jpg',
    certificateTemplateId: 'cert-adoption',
    certificateOverrideName: 'Thank you for adopting Bumi!', // 39 chars
    certificateText:
      'Your adoption helps provide daily food, medical care, and rehabilitation support for Bumi as he learns the skills needed to return to the wild. Every contribution helps us protect endangered orangutans and preserve their rainforest home.' // 240 chars
  },
  {
    id: 'adopt-maya',
    name: 'Adopt Maya the Healing Orangutan Survivor', // 42 chars
    description: "Thank you for funding Maya's rehabilitation journey!", // 52 chars
    minPrice: 3,
    default: 10,
    frequency: 'monthly',
    image: '/imgs/orangutan-images/jeni.jpg',
    certificateTemplateId: 'cert-adoption',
    certificateOverrideName: 'Maya',
    certificateText:
      'Maya requires specialized medical care due to injuries from the illegal pet trade. Your support ensures she receives the treatment she needs and helps fund her path to recovery and eventual release.' // 199 chars
  },
  {
    id: 'tree-planting',
    name: 'Plant 10 Native Rainforest Trees for Wildlife', // 46 chars
    description: 'Plant native trees to restore orangutan habitat.', // 48 chars
    price: 30,
    frequency: 'once',
    image: null
  },
  {
    id: 'education-program',
    name: 'Support Local Conservation Education Program', // 45 chars
    description: 'Fund conservation education in local communities.', // 49 chars
    minPrice: 5,
    default: 25,
    frequency: 'monthly',
    image: null,
    certificateText:
      'Your support funds conservation education programs that teach local communities sustainable practices and inspire the next generation of wildlife protectors.'
  }
]
