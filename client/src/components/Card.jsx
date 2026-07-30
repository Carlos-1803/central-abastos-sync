import PropTypes from 'prop-types';

const Card = ({ title, value, trend, icon, className, children }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 flex flex-col h-full ${className || ''}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="flex-shrink-0 h-8 w-8 bg-primary/10 text-primary rounded flex items-center justify-center">
                {icon}
              </div>
            )}
            <div>
              {title && <p className="text-sm font-medium text-gray-500">{title}</p>}
              {value && <p className="text-2xl font-bold text-gray-900">{value}</p>}
            </div>
          </div>
          {trend && (
            <span
              className={`px-2 py-0.5 text-xs rounded ${
                trend.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  trend: PropTypes.string,
  icon: PropTypes.element,
  className: PropTypes.string,
  children: PropTypes.node
};

export default Card;