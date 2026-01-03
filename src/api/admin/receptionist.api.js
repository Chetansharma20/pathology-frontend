export const getReceptionists = async (params = {}) => {
  return {
    data: [
      {
        _id: 'R-001',
        name: 'Priya Sharma',
        mobile: '9876543210',
        email: 'priya@example.com',
        address: 'Connaught Place, New Delhi',
        status: 'Active',
        role: 'Operator',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'R-002',
        name: 'Rajesh Kumar',
        mobile: '9876543211',
        email: 'rajesh@example.com',
        address: 'MG Road, Bangalore',
        status: 'Active',
        role: 'Operator',
        createdAt: new Date().toISOString()
      }
    ],
    total: 2,
    totalPages: 1,
    page: params.page || 1,
    limit: params.limit || 10
  };
};

export const createReceptionist = async (receptionistData) => {
  try {
    const response = await fetch('/api/receptionists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receptionistData)
    });
    if (!response.ok) throw new Error('Failed to create receptionist');
    return await response.json();
  } catch (error) {
    console.error('Error creating receptionist:', error);
    throw error;
  }
};

export const updateReceptionist = async (receptionistId, receptionistData) => {
  try {
    const response = await fetch(`/api/receptionists/${receptionistId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receptionistData)
    });
    if (!response.ok) throw new Error('Failed to update receptionist');
    return await response.json();
  } catch (error) {
    console.error('Error updating receptionist:', error);
    throw error;
  }
};

export const deleteReceptionist = async (receptionistId) => {
  try {
    const response = await fetch(`/api/receptionists/${receptionistId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete receptionist');
    return true;
  } catch (error) {
    console.error('Error deleting receptionist:', error);
    throw error;
  }
};

export const toggleReceptionistStatus = async (receptionistId, status) => {
  try {
    const response = await fetch(`/api/receptionists/${receptionistId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update receptionist status');
    return await response.json();
  } catch (error) {
    console.error('Error updating receptionist status:', error);
    throw error;
  }
};

