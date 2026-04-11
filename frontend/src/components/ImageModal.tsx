import { X } from 'lucide-react';

interface ImageModalProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export default function ImageModal({ src, alt, onClose }: ImageModalProps) {
  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
        zIndex: 9999, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '2rem',
        boxSizing: 'border-box'
      }}
      onClick={onClose}
    >
      <button 
        onClick={onClose} 
        style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer',
          padding: '0.5rem',
          zIndex: 10000,
          color: 'var(--text-color)'
        }}
      >
        <X size={32} />
      </button>
      <img 
        src={src} 
        alt={alt || "Enlarged view"} 
        style={{ 
          maxWidth: '100%', 
          maxHeight: '100%', 
          objectFit: 'contain',
          cursor: 'default'
        }} 
        onClick={(e) => e.stopPropagation()} 
      />
    </div>
  );
}
