import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, we would get the user ID from auth context
    const userId = 1; // placeholder
    fetchUser(userId);
  }, []);

  const fetchUser = async (id) => {
    try {
      const res = await api.get(`/users/${id}`);
      setUser(res.data);
    } catch (err) {
      console.error('Failed to load user', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!user) return <div className="text-center py-12">User not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <button
          onClick={() => navigate('/profile/edit')}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 bg-primary/20 text-primary rounded-full flex items-center justify-center">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold">{user.username}</h2>
              <p className="text-gray-500">{user.role?.name || 'No role assigned'}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium mb-2">Account Information</h3>
            <div className="space-y-3">
              <div className="flex">
                <span className="w-20 text-gray-500">Username:</span>
                <span className="font-medium">{user.username}</span>
              </div>
              <div className="flex">
                <span className="w-20 text-gray-500">Email:</span>
                <span>{user.email || 'Not set'}</span>
              </div>
              <div className="flex">
                <span className="w-20 text-gray-500">Role:</span>
                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded">
                  {user.role?.name}
                </span>
              </div>
              <div className="flex">
                <span className="w-20 text-gray-500">Status:</span>
                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium mb-2">Activity Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Orders Created</span>
              <span className="font-medium">124</span>
            </div>
            <div className="flex justify-between">
              <span>Last Login</span>
              <span className="font-medium">Today, 10:30 AM</span>
            </div>
            <div class="flex justify-between">
              <span>Profile Completeness</span>
              <span className="font-medium">80%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;