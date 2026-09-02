export interface FlowerVariant {
  color: string
  hexColor: string
  basePrice: number
  qty: number
}

export interface FlowerGroup {
  name: string
  available: boolean
  image: string
  variants: FlowerVariant[]
}

export interface Bouquet {
  title: string
  price: number
  img: string
  available: boolean
}

export interface Catalog {
  makeYourOwn: FlowerGroup[]
  shopBouquets: Bouquet[]
}
