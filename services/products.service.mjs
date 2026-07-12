import {
  findAll,
  findOne,
  createProduct,
} from '../repositories/products.repository.mjs';

const INTERNAL_COST_RATIO = 0.6;

function calculateInternalCost(price) {
  const rawCost = price * INTERNAL_COST_RATIO;
  const roundedCost = Math.round(rawCost * 100) / 100;

  return roundedCost;
}

export function listProducts() {
  return findAll();
}

export function getByIdProducts(productId) {
  return findOne(productId);
}

export function buildProduct(productInput) {
  const internalCost = calculateInternalCost(productInput.price);
  const productToInsert = { ...productInput, internalCost };

  return createProduct(productToInsert);
}
