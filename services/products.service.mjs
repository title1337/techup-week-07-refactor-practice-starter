import { findAll } from '../repositories/products.repository.mjs';

export function listProducts() {
  return findAll();
}
