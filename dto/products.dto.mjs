export function publicProductDto(product) {
  return {
    product_id: product.product_id,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    stock: product.stock,
    created_at: product.created_at,
    updated_at: product.updated_at,
  };
}
