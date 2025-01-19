const attributesApi = {
  create: async (data) => {
    const response = await fetch('/api/attributes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create attribute');
    }
    
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`/api/attributes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update attribute');
    }
    
    return response.json();
  }
};

export default attributesApi; 