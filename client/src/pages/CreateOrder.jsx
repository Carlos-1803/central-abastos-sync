import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { api } from '../services/api';

const CreateOrder = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    clientId: '',
    items: [{ productId: '', quantity: 1 }],
    deliveryAddress: '',
    deliveryLatitude: '',
    deliveryLongitude: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClients();
    fetchProducts();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch (err) {
      console.error('Failed to load clients', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1 }]
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('items[')) {
      // Handle array input
      const match = name.match(/items\[(\d+)\]\.(.+)/);
      if (match) {
        const [, index, field] = match;
        setFormData(prev => {
          const items = [...prev.items];
          items[parseInt(index)][field] = field === 'quantity' ? parseInt(value) || 1 : value;
          return { ...prev, items };
        });
      }
    } else if (name === 'clientId') {
      setFormData(prev => ({ ...prev, clientId: value }));
    } else if (name === 'deliveryAddress') {
      setFormData(prev => ({ ...prev, deliveryAddress: value }));
    } else if (name === 'deliveryLatitude') {
      setFormData(prev => ({ ...prev, deliveryLatitude: value }));
    } else if (name === 'deliveryLongitude') {
      setFormData(prev => ({ ...prev, deliveryLongitude: value }));
    } else if (name === 'notes') {
      setFormData(prev => ({ ...prev, notes: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Calculate total amount
    let total = 0;
    const itemsWithPrice = formData.items.map(item => {
      const product = products.find(p => p.id === parseInt(item.productId));
      const price = product ? product.price : 0;
      const subtotal = price * item.quantity;
      total += subtotal;
      return { ...item, unitPrice: price };
    });

    const orderData = {
      clientId: formData.clientId,
      items: itemsWithPrice,
      deliveryAddress: formData.deliveryAddress,
      deliveryLatitude: formData.deliveryLatitude,
      deliveryLongitude: formData.deliveryLongitude,
      notes: formData.notes,
      totalAmount: total
    };

    try {
      const response = await api.post('/orders', orderData);
      navigate(`/orders/${response.data.id}`);
    } catch (err) {
      setError('Failed to create order. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Create New Order</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer
            </label>
            <select
              value={formData.clientId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              name="clientId"
            >
              <option value="">Select a customer</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Address (Optional)
            </label>
            <input
              type="text"
              value={formData.deliveryAddress}
              onChange={handleChange}
              placeholder="Street address, city, postal code"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              name="deliveryAddress"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude (Optional)
              </label>
              <input
                type="number"
                step="any"
                value={formData.deliveryLatitude || ''}
                onChange={handleChange}
                placeholder="e.g., 40.7128"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                name="deliveryLatitude"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude (Optional)
              </label>
              <input
                type="number"
                step="any"
                value={formData.deliveryLongitude || ''}
                onChange={handleChange}
                placeholder="e.g., -74.0060"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                name="deliveryLongitude"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Items
            </label>
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">Item {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-500 hover:text-red-700"
                      disabled={formData.items.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product
                      </label>
                      <select
                        value={item.productId}
                        onChange={e => handleChange({ target: { name: `items[${index}].productId`, value: e.target.value } })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Select product</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} - ${p.price}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity || 1}
                        onChange={e => handleChange({ target: { name: `items[${index}].quantity`, value: e.target.value } })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="mt-2 flex items-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-sm font-medium text-blue-600"
            >
              <span className="mr-2">+</span> Add Item
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Any special instructions..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              name="notes"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="mr-3 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              {loading ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrder;