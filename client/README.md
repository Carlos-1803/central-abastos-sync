# Frontend Client - Central Abastos Logistics System

This directory contains the frontend application for the Central Abastos Logistics System, built with React.

## Technology Stack

- **React 18** - UI library
- **React Router v6** - Client-side routing
- **CSS Custom Properties** - For theming and styling (Tailwind/Shadcn inspiration)
- **Axios** - HTTP client for API communication

## Folder Structure

```
client/
├── public/                 # Static assets (index.html, favicon, etc.)
├── src/
│   ├── assets/             # Images, icons, logos
│   ├── components/         # Reusable UI components
│   │   ├── Layout.jsx      # Main layout with sidebar and header
│   │   ├── Sidebar.jsx     # Navigation sidebar with role-based menus
│   │   ├── icons/          # SVG icon components
│   │   └── ...             # Other shared components (buttons, cards, etc.)
│   ├── pages/              # Page components (views)
│   │   ├── Home.jsx        # Dashboard overview
│   │   ├── Orders.jsx      # List of orders
│   │   ├── CreateOrder.jsx # Form to create new orders
│   │   ├── Trucks.jsx      # Fleet management
│   │   ├── Clients.jsx     # Customer management
│   │   └── Profile.jsx     # User profile
│   ├── services/           # Service layers
│   │   └── api.js          # Axios instance with interceptors
│   ├── App.jsx             # Main app component with routing
│   ├── main.jsx            # Entry point (ReactDOM render)
│   └── index.css           # Global CSS variables and base styles
└── package.json            # Project dependencies and scripts
```

## Key Features

### Role-Based Navigation
The `Sidebar` component dynamically shows different navigation items based on the user's role:
- **Admin**: Full access to all modules (users, orders, trucks, clients, analytics)
- **Levanta Pedidos (Order Taker)**: Focus on creating orders, viewing clients/products
- **Bodega (Warehouse)**: Order management, truck loading verification
- **Chofer (Driver)**: Route viewing, delivery confirmation

### Core Pages

#### Dashboard (`Home.jsx`)
- Overview cards with key metrics (orders today, revenue, active trucks, pending items)
- Recent orders list
- System status indicators

#### Orders Management
- **Orders List (`Orders.jsx`)**: Searchable, filterable table with pagination
- **Create Order (`CreateOrder.jsx`)**: 
  - Client selection dropdown
  - Product search with quantity inputs
  - Optional geolocation fields for delivery address
  - Automatic total calculation
  - Notes field for special instructions

#### Fleet Management (`Trucks.jsx`)
- Truck inventory with status indicators
- Capacity utilization tracking
- Driver assignment management
- Maintenance scheduling (placeholder)

#### Client Management (`Clients.jsx`)
- Customer directory with contact information
- Active/inactive status tracking
- Order history linking (planned)

#### Profile (`Profile.jsx`)
- User information and account settings
- Activity summary
- Preferences management

## API Integration

All API calls go through the `services/api.js` Axios instance which:
- Automatically attaches JWT tokens from `localStorage`
- Handles basic error interception
- Uses relative URL `/api` (proxy to backend in development)

Example endpoint calls:
```javascript
// Get all orders
await api.get('/orders');

// Create new order
await api.post('/orders', orderData);

// Update truck assignment
await api.put(`/orders/${id}/assign-truck/${truckId}`);
```

## Styling Approach

The UI follows a clean, modern aesthetic with:
- **Color palette**: 
  - Primary: Deep blue (`#2563eb`)
  - Secondary: Slate gray (`#64748b`)
  - Success: Emerald green (`#10b981`)
  - Warning: Amber (`#f59e0b`)
  - Danger: Red (`#ef4444`)
- **Component style**: Card-based layout with subtle shadows and rounded corners
- **Responsive design**: Mobile-first approach with collapsible sidebar on smaller screens
- **Typography**: System font stack for optimal readability

## State Management

Currently uses React's built-in `useState` and `useEffect` hooks for component state. For future scalability, consider:
- React Query for server state
- Context API or Redux for complex global state
- Form libraries (React Hook Form, Formik) for complex forms

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```
   (Assumes Vite configuration - adjust based on actual setup)

3. Build for production:
   ```bash
   npm run build
   ```

## Environment Variables

Create a `.env` file in the client root:
```
VITE_API_URL=https://your-backend-domain.com/api
```

## Backend API Expectations

The frontend expects the following API endpoints (see backend documentation for full specification):

### Authentication (to be implemented)
- `POST /auth/login` - Returns JWT token
- `POST /auth/logout` - Clears token

### Orders
- `GET /orders` - List all orders (with filtering/pagination)
- `GET /orders/:id` - Get specific order
- `POST /orders` - Create new order
- `PUT /orders/:id` - Update order
- `DELETE /orders/:id` - Delete order
- `PUT /orders/:id/assign-truck/:truckId` - Assign truck to order
- `GET /routes/:driverId` - Get delivery route coordinates for driver

### Trucks
- `GET /trucks` - List all trucks
- `GET /trucks/:id` - Get specific truck
- `POST /trucks` - Create new truck
- `PUT /trucks/:id` - Update truck
- `DELETE /trucks/:id` - Delete truck
- `PUT /trucks/:id/assign-driver/:userId` - Assign driver to truck

### Clients
- `GET /clients` - List all clients
- `GET /clients/:id` - Get specific client
- `POST /clients` - Create new client
- `PUT /clients/:id` - Update client
- `DELETE /clients/:id` - Delete client

### Users & Roles
- `GET /users` - List users (admin only)
- `GET /roles` - Get available roles

## Future Enhancements

1. **Authentication System** - Implement JWT-based login/logout
2. **Real-time Updates** - WebSocket integration for live order/status updates
3. **Advanced Filtering** - Server-side filtering, sorting, and pagination
4. **Data Visualization** - Charts for analytics using Recharts or Chart.js
5. **Offline Capabilities** - Service Worker and local storage for poor connectivity areas
6. **Internationalization** - i18n support for multiple languages
7. **Testing** - Unit tests with Jest and React Testing Library
8. **Performance Optimization** - Code splitting, lazy loading, memoization

## Design Principles

- **Simplicity**: Clean interface focused on core logistics operations
- **Clarity**: Clear visual hierarchy and meaningful feedback
- **Efficiency**: Minimize steps to complete common operations
- **Consistency**: Uniform patterns across all modules
- **Accessibility**: Follow WCAG guidelines for color contrast and keyboard navigation

---

*Built for the Central Abastos Logistics System to streamline order management, fleet operations, and delivery tracking.*