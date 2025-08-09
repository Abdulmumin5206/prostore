export type Category = {
  id: string;
  name: string;
  created_at: string;
};

export type BaseProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null; // legacy text category
  category_id: string | null; // new relation to categories
  stock_quantity: number; // added column
  attributes: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type NewProduct = BaseProduct & { product_type: 'new' };
export type SecondhandProduct = BaseProduct & { product_type: 'secondhand'; condition: string | null };
export type AnyProduct = NewProduct | SecondhandProduct; 