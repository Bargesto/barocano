export type ProductSize = 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL' | '4XL' | '5XL' | '6XL';
export type ShoeSize = '36' | '37' | '38' | '39' | '40' | '41' | '42' | '43' | '44' | '45';

type ClothingSizes = {
  [key in ProductSize]: number;
};

type ShoeSizes = {
  [key in ShoeSize]: number;
};

interface BaseProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  createdAt: number;
}

interface ClothingProduct extends BaseProduct {
  type: 'clothing';
  sizes: ClothingSizes;
}

interface ShoeProduct extends BaseProduct {
  type: 'shoes';
  sizes: ShoeSizes;
}

export type Product = ClothingProduct | ShoeProduct;

export interface Order {
  id: string;
  productId: string;
  instagramUsername: string;
  size: ProductSize | ShoeSize;
  timestamp: number;
}