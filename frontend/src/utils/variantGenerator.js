export function generateVariantCombinations(attributes, selectedAttributes) {
  // Filter only selected variant attributes
  const variantAttributes = attributes.filter(attr => 
    selectedAttributes.includes(attr.id) && attr.is_variant
  );

  // Get all possible values for each attribute
  const attributeValues = variantAttributes.map(attr => {
    return {
      attributeId: attr.id,
      attributeName: attr.name,
      values: attr.values.map(v => ({
        id: v.id,
        value: v.value
      }))
    };
  });

  // Generate all possible combinations
  const combinations = cartesianProduct(attributeValues.map(attr => attr.values));

  // Format combinations into variant objects
  return combinations.map(combination => {
    const attributes = {};
    const sku = [];
    const name = [];

    combination.forEach((value, index) => {
      const attrId = attributeValues[index].attributeId;
      attributes[attrId] = value.id;
      sku.push(value.value.substring(0, 2).toUpperCase());
      name.push(`${attributeValues[index].attributeName}: ${value.value}`);
    });

    return {
      attributes,
      sku: sku.join('-'),
      name: name.join(', '),
      price: '',
      stock: '',
      is_active: true
    };
  });
}

// Helper function to generate cartesian product of arrays
function cartesianProduct(arrays) {
  return arrays.reduce((acc, curr) => {
    if (acc.length === 0) return curr.map(x => [x]);
    return acc.flatMap(x => curr.map(y => [...x, y]));
  }, []);
} 