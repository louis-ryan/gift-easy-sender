import { useEffect, useRef, useState } from 'react';
import { API } from '../utils/money';

// Giphy search, through gift-ease so the API key stays on the server.
// Giphy's terms require the "Powered by GIPHY" attribution.
const GifPicker = ({ onPick, onClose }) => {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const timer = useRef(null);

  const search = (q) => {
    setLoading(true);
    setError('');
    fetch(`${API}/api/giphySearch?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => {
        setGifs(d.gifs || []);
        if (d.error) setError(d.error);
      })
      .catch(() => setError('GIF search is unavailable right now'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    search('');
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const onQuery = (q) => {
    setQuery(q);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(q), 350);
  };

  return (
    <div className="sender-sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sender-sheet" role="dialog" aria-label="Choose a GIF">
        <div className="sender-sheet-head">
          <input
            className="sender-input"
            type="search"
            placeholder="Search GIFs"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            autoFocus
          />
          <button type="button" className="sender-sheet-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="sender-gif-grid">
          {gifs.map((g) => (
            <button key={g.id} type="button" className="sender-gif" onClick={() => onPick(g.url)} aria-label={g.title || 'GIF'}>
              <img src={g.previewUrl} alt={g.title || ''} loading="lazy" />
            </button>
          ))}
          {!loading && !gifs.length && <p className="sender-hint">{error || 'No GIFs found'}</p>}
        </div>
        <p className="sender-giphy-credit">Powered by GIPHY</p>
      </div>
    </div>
  );
};

export default GifPicker;
