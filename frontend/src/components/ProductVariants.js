import React, { useState, useEffect } from 'react';
import { Form, Button, Table, Alert } from 'react-bootstrap';
import { generateVariantCombinations } from '../utils/variantGenerator';
import { toast } from 'react-toastify';

const ProductVariants = ({ productId, attributes, onSave }) => {
  const [variants, setVariants] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (productId) {
      loadExistingVariants();
    }
  }, [productId]);

  const loadExistingVariants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/variants/product/${productId}`);
      if (!response.ok) throw new Error('Failed to load variants');
      const data = await response.json();
      setVariants(data);
      
      // Extract selected attributes from existing variants
      const attrIds = new Set();
      data.forEach(variant => {
        variant.attributes.forEach(attr => attrIds.add(attr.attribute_id));
      });
      setSelectedAttributes(Array.from(attrIds));
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVariants = () => {
    try {
      const newVariants = generateVariantCombinations(attributes, selectedAttributes);
      
      // Preserve existing variant data where possible
      const mergedVariants = newVariants.map(newVariant => {
        const existingVariant = variants.find(v => 
          JSON.stringify(v.attributes) === JSON.stringify(newVariant.attributes)
        );
        return existingVariant ? { ...newVariant, ...existingVariant } : newVariant;
      });

      setVariants(mergedVariants);
    } catch (error) {
      setError('Failed to generate variants');
      toast.error(error.message);
    }
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: value
    };
    setVariants(updatedVariants);
  };

  const validateVariants = () => {
    const errors = [];
    variants.forEach((variant, index) => {
      if (!variant.sku) errors.push(`Variant ${index + 1}: SKU is required`);
      if (!variant.price) errors.push(`Variant ${index + 1}: Price is required`);
      if (variant.stock === '') errors.push(`Variant ${index + 1}: Stock is required`);
    });
    return errors;
  };

  const handleSave = async () => {
    const errors = validateVariants();
    if (errors.length > 0) {
      setError(errors.join('\n'));
      toast.error('Please fix validation errors');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/variants/product/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variants, replaceAll: true })
      });

      if (!response.ok) throw new Error('Failed to save variants');
      
      const savedVariants = await response.json();
      setVariants(savedVariants);
      toast.success('Variants saved successfully');
      if (onSave) onSave(savedVariants);
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-variants">
      <div className="mb-4">
        <h4>Variant Attributes</h4>
        <div className="d-flex flex-wrap gap-2">
          {attributes.filter(attr => attr.is_variant).map(attr => (
            <Form.Check
              key={attr.id}
              type="checkbox"
              label={attr.name}
              checked={selectedAttributes.includes(attr.id)}
              onChange={e => {
                if (e.target.checked) {
                  setSelectedAttributes([...selectedAttributes, attr.id]);
                } else {
                  setSelectedAttributes(selectedAttributes.filter(id => id !== attr.id));
                }
              }}
            />
          ))}
        </div>
        <Button 
          variant="outline-primary" 
          className="mt-2"
          onClick={handleGenerateVariants}
          disabled={selectedAttributes.length === 0}
        >
          Generate Variants
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {variants.length > 0 && (
        <>
          <Table responsive>
            <thead>
              <tr>
                <th>Variant</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant, index) => (
                <tr key={index}>
                  <td>{variant.name}</td>
                  <td>
                    <Form.Control
                      type="text"
                      value={variant.sku}
                      onChange={e => handleVariantChange(index, 'sku', e.target.value)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={variant.price}
                      onChange={e => handleVariantChange(index, 'price', e.target.value)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={variant.stock}
                      onChange={e => handleVariantChange(index, 'stock', e.target.value)}
                    />
                  </td>
                  <td>
                    <Form.Check
                      type="switch"
                      checked={variant.is_active}
                      onChange={e => handleVariantChange(index, 'is_active', e.target.checked)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Button 
            variant="primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Variants'}
          </Button>
        </>
      )}
    </div>
  );
};

export default ProductVariants; 