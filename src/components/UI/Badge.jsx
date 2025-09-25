import { statusConfig } from '../../data/mockData';

// Badge-Komponente für Status-Anzeige
const Badge = ({ 
  status, 
  children, 
  className = "", 
  size = "sm",
  variant = "default",
  showIcon = false 
}) => {
  const config = statusConfig[status] || statusConfig.frei;
  
  // Größen-Varianten
  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-xs",
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base"
  };

  // Varianten
  const variantClasses = {
    default: `${config.bgColor} ${config.textColor}`,
    outline: `bg-transparent border ${config.borderColor} ${config.textColor}`,
    solid: `bg-${config.color}-600 text-white`
  };

  return (
    <span 
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {showIcon && (
        <div className={`w-2 h-2 rounded-full mr-1.5 ${
          status === 'frei' ? 'bg-green-500' : 
          status === 'belegt' ? 'bg-red-500' : 
          'bg-yellow-500'
        }`} />
      )}
      {children || config.label}
    </span>
  );
};

export default Badge;