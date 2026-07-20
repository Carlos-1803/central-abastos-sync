import { Card } from '../components/Card';

const Home = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Today's Orders" value="24" trend="+12%" icon={<truckIcon />}>
          Orders processed today
        </Card>
        <Card title="Revenue" value="$12,450" trend="+8%" icon={<dollarSignIcon />}>
          This month
        </Card>
        <Card title="Active Trucks" value="8" trend="+2" icon={<mapPinIcon />}>
          Out for delivery
        </Card>
        <Card title="Pending" value="5" trend="-3" icon={<alertCircleIcon />}>
          Requires attention
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-96">
          <h2 className="mb-4 text-lg font-semibold">Recent Orders</h2>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Order #1024</p>
                  <p className="text-sm text-gray-500">Acme Corp</p>
                </div>
                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">Delivered</span>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Order #1023</p>
                  <p className="text-sm text-gray-500">Beta LLC</p>
                </div>
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">Pending</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="h-96">
          <h2 className="mb-4 text-lg font-semibold">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-3 w-3 bg-green-500 rounded-full"></div>
              <span>Database: Online</span>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0 h-3 w-3 bg-green-500 rounded-full"></span>
                <span>API Server: Online</span>
              </div>
            <div className="flex items-center">
              <div className="flex-shrink-0 h-3 w-3 bg-yellow-500 rounded-full"></div>
              <span>Warehouse Sync: Delayed (2 min)</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Simple icon components
const truckIcon = () => (
  <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v1a1 1 0 001 1h1.586l-1.293 1.293a1 1 0 101.414 1.414L6.172 11H4a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 001-1v-1h2.414l1.293 1.293a1 1 0 001.414-1.414L9.414 13H18a1 1 0 001-1v-2a1 1 0 00-1-1h-1.414l1.293-1.293a1 1 0 00-1.414-1.414L15.586 9H12a1 1 0 00-1-1V5a1 1 0 00-1-1H6a1 1 0 00-1 1v1a1 1 0 001 1h1.586l-1.293-1.293a1 1 0 00-1.414-1.414L4.414 5H4a2 2 0 00-2-2V4a2 2 0 002-2h10a2 2 0 002 2v1a1 1 0 001 1h1.586l-1.293 1.293a1 1 0 10-1.414 1.414L14.414 7H16a1 1 0 001 1v1a1 1 0 001-1h2a1 1 0 001 1v1a1 1 0 001-1h1.586l1.293-1.293a1 1 0 00-1.414-1.414L18.414 5H20a2 2 0 002-2V4a2 2 0 00-2-2H4z" clipRule="evenodd" />
  </svg>
);

const dollarSignIcon = () => (
  <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 4a1 1 0 100 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L13.5 8H18a1 1 0 100 2h-2.586l1.293-1.293a1 1 0 00-1.414-1.414L10.5 6H6a1 1 0 100-2h3.586l-1.293 1.293a1 1 0 10-1.414 1.414L6.5 8H2a1 1 0 100-2h2.586l-1.293-1.293a1 1 0 001.414-1.414L10.5 4H9z" clipRule="evenodd" />
  </svg>
);

const mapPinIcon = () => (
  <svg className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
  </svg>
);

const alertCircleIcon = () => (
  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 100-2 1 1 0 000 2zM10 7a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
  </svg>
);

export default Home;