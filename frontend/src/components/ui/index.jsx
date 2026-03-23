// Button.jsx
const variants = {
  primary: 'bg-primary text-white hover:bg-purple-700',
  outline: 'border border-primary text-primary hover:bg-purple-50',
  ghost:   'text-gray-600 hover:bg-gray-100',
  danger:  'bg-red-500 text-white hover:bg-red-600',
};

export function Button({ children, variant = 'primary', className = '', loading, ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50 cursor-pointer ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}

// Avatar.jsx
export function Avatar({ src, name, size = 'md' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-xl' };
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  return src
    ? <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover flex-shrink-0`} />
    : <div className={`${sizes[size]} rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0`}>{initials}</div>;
}

// Spinner.jsx
export function Spinner() {
  return (
    <div className="flex justify-center items-center py-16">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Card.jsx
export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 ${className}`}>
      {children}
    </div>
  );
}
