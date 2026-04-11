import { Camera } from 'lucide-react';

interface InstagramPost {
  id: string;
  url: string;
  image: string;
}

const MOCK_POSTS: InstagramPost[] = [
  { id: '1', url: 'https://www.instagram.com/p/DB123456789/', image: '/images/events/Events - Flowers for People/Sub-1.webp' },
  { id: '2', url: 'https://www.instagram.com/p/DB223456789/', image: '/images/events/Events - Flowers for People/Sub-2.webp' },
  { id: '3', url: 'https://www.instagram.com/p/DB323456789/', image: '/images/events/Events - Flowers for People/Sub-4.webp' },
  { id: '4', url: 'https://www.instagram.com/p/DB423456789/', image: '/images/events/Events - Flowers for People/Sub-5.webp' },
  { id: '5', url: 'https://www.instagram.com/p/DB523456789/', image: '/images/events/Events - Flowers for People/Sub-6.webp' },
  { id: '6', url: 'https://www.instagram.com/p/DB623456789/', image: '/images/events/Events - Flowers for People/Sub-7.webp' },
];

export default function InstagramFeed() {
  return (
    <div className="instagram-widget" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)', padding: '2px', borderRadius: '50%', display: 'flex' }}>
            <div style={{ background: '#fff', padding: '2px', borderRadius: '50%', display: 'flex' }}>
              <Camera size={24} color="#000" />
            </div>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>@vincent_flowers_porto</h3>
            <span style={{ fontSize: '0.85rem', color: '#666' }}>Follow us for daily inspiration</span>
          </div>
        </div>
        <a 
          href="https://www.instagram.com/vincent_flowers_porto/" 
          target="_blank" 
          rel="noreferrer"
          style={{ fontSize: '0.9rem', color: 'var(--text-color)', border: '1px solid var(--text-color)', padding: '0.4rem 1rem', textDecoration: 'none' }}
        >
          View Profile
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
        {MOCK_POSTS.map((post) => (
          <a key={post.id} href={post.url} target="_blank" rel="noreferrer" style={{ display: 'block', aspectRatio: '1/1', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <img 
              src={post.image} 
              alt="Instagram Post" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
          </a>
        ))}
      </div>
      
      <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#888', textAlign: 'center' }}>
        Live feed simulated. Connect your account to use a real-time widget.
      </p>
    </div>
  );
}
