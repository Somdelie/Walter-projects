import { getProductTypes } from '@/actions/productTypes';
import ProductTypesListing from '@/components/dashboard/products/ProductTypesListing';
import React from 'react'

export default async function ProductTypesPage() {

    const productTypes = await getProductTypes();

  return (
    <ProductTypesListing types={productTypes}/>
  )
}
