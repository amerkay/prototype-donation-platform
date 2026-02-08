import type { Product } from '~/features/donation-form/features/product/shared/types'

export const products: Product[] = [
  {
    id: 'adopt-bumi',
    name: 'Adopt Bumi the Orangutan',
    description: "Monthly sponsorship to support Bumi's care and rehabilitation",
    minPrice: 3,
    default: 10,
    frequency: 'monthly',
    image: '/imgs/orangutan-images/baimah.jpg',
    certificateOverrideName: 'Bumi'
  },
  {
    id: 'adopt-maya',
    name: 'Adopt Maya the Orangutan',
    description: "Monthly sponsorship for Maya's ongoing medical care",
    minPrice: 3,
    default: 10,
    frequency: 'monthly',
    image: '/imgs/orangutan-images/jeni.jpg',
    certificateOverrideName: 'Maya'
  },
  {
    id: 'tree-planting',
    name: 'Plant 10 Trees',
    description: 'Help restore orangutan habitat with native tree planting',
    price: 30,
    frequency: 'once',
    image: null
  },
  {
    id: 'education-program',
    name: 'Support Education Program',
    description: 'Monthly contribution to local conservation education',
    minPrice: 5,
    default: 25,
    frequency: 'monthly',
    image: null
  }
]
