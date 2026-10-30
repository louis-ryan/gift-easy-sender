import { useEffect, useRef, useState } from 'react';
import GifPicker from './GifPicker';
import { API } from '../utils/money';

export const MAX_MESSAGE = 500;
export const MAX_PHOTOS = 4;
const EMOJI = ['❤️', '🎉', '🥳', '🎁', '😊', '🙌'];

// Resizes a photo in the browser before upload (phone photos are often 5–10 MB).
// iPhones hand Safari HEIC photos as JPEG via the file picker; if a browser can't decode
// the file at all we upload it as-is when it's a small, common format.
async function resizeImage(file, maxSide = 1600, quality = 0.85) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (blob) return new File([blob], 'photo.jpg', { type: 'image/jpeg' });
  } catch {
    // fall through
  }
  if (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) && file.size < 10 * 1024 * 1024) return file;
  throw new Error("We couldn't read that photo. Please try a different one.");
}

async function uploadPhoto(file) {
  const resized = await resizeImage(file);
  const body = new FormData();
  body.append('file', resized);
  const res = await fetch(`${API}/api/uploadToAWS`, { method: 'POST', body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed. Please try again.');
  return data.url;
}

// One simple, mobile-first composer: a message with bold/italic, up to 4 photos and one GIF.
// Everything is optional. The message is plain text with **bold** / _italic_ markers.
// `onChange` is a useState setter (it's also called with an updater function)
const MessageComposer = ({ value, onChange, onBusyChange }) => {
  const textRef = useRef(null);
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState('');
  const [gifOpen, setGifOpen] = useState(false);
  const [gifsAvailable, setGifsAvailable] = useState(false);

  // GIFs need a Giphy key on gift-ease; hide the option without one
  useEffect(() => {
    fetch(`${API}/api/giphySearch?q=`)
      .then((r) => r.json())
      .then((d) => setGifsAvailable(Boolean(d.configured)))
      .catch(() => setGifsAvailable(false));
  }, []);

  useEffect(() => {
    onBusyChange?.(uploading > 0);
  }, [uploading]);

  const update = (patch) => onChange((prev) => ({ ...prev, ...patch }));

  // Wraps the selected text in markers (or inserts empty ones at the cursor)
  const wrap = (marker) => {
    const el = textRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const text = value.message;
    const selected = text.slice(start, end);
    const next = `${text.slice(0, start)}${marker}${selected}${marker}${text.slice(end)}`;
    if (next.length > MAX_MESSAGE) return;
    update({ message: next });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + marker.length, end + marker.length);
    });
  };

  const insert = (str) => {
    const el = textRef.current;
    const pos = el ? el.selectionStart : value.message.length;
    const next = `${value.message.slice(0, pos)}${str}${value.message.slice(pos)}`;
    if (next.length > MAX_MESSAGE) return;
    update({ message: next });
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(pos + str.length, pos + str.length);
    });
  };

  const onFiles = async (e) => {
    const files = [...(e.target.files || [])].slice(0, MAX_PHOTOS - value.photoUrls.length);
    e.target.value = '';
    if (!files.length) return;
    setError('');
    setUploading((n) => n + files.length);
    const urls = [];
    for (const file of files) {
      try {
        urls.push(await uploadPhoto(file));
      } catch (err) {
        setError(err.message);
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (urls.length) onChange((prev) => ({ ...prev, photoUrls: [...prev.photoUrls, ...urls].slice(0, MAX_PHOTOS) }));
  };

  const photoSlots = MAX_PHOTOS - value.photoUrls.length - uploading;

  return (
    <div className="sender-composer">
      {/* Message */}
      <div className="sender-field">
        <label className="sender-label" htmlFor="gift-message">Message</label>
        <div className="sender-textbox">
          <div className="sender-toolbar">
            <button type="button" className="sender-tool" onClick={() => wrap('**')} aria-label="Bold"><strong>B</strong></button>
            <button type="button" className="sender-tool" onClick={() => wrap('_')} aria-label="Italic"><em>I</em></button>
            <span className="sender-tool-sep" />
            {EMOJI.map((em) => (
              <button key={em} type="button" className="sender-tool emoji" onClick={() => insert(em)} aria-label={`Add ${em}`}>{em}</button>
            ))}
          </div>
          <textarea
            id="gift-message"
            ref={textRef}
            className="sender-textarea bare"
            value={value.message}
            onChange={(e) => update({ message: e.target.value.slice(0, MAX_MESSAGE) })}
            placeholder="Write something nice…"
            rows={4}
          />
        </div>
        <span className="sender-hint right">{value.message.length}/{MAX_MESSAGE}</span>
      </div>

      {/* Photos */}
      <div className="sender-field">
        <label className="sender-label">Photos of you together</label>
        <div className="sender-media-row">
          {value.photoUrls.map((url) => (
            <div key={url} className="sender-thumb">
              <img src={url} alt="" />
              <button
                type="button"
                className="sender-thumb-remove"
                aria-label="Remove photo"
                onClick={() => update({ photoUrls: value.photoUrls.filter((u) => u !== url) })}
              >
                ×
              </button>
            </div>
          ))}
          {Array.from({ length: uploading }).map((_, i) => (
            <div key={`up-${i}`} className="sender-thumb loading"><span className="sender-spinner" /></div>
          ))}
          {photoSlots > 0 && (
            <button type="button" className="sender-thumb add" onClick={() => fileRef.current?.click()}>
              <span aria-hidden="true">＋</span>
              <span>Add photo</span>
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onFiles}
          style={{ display: 'none' }}
        />
        {error && <span className="sender-hint error">{error}</span>}
      </div>

      {/* GIF */}
      {gifsAvailable && (
        <div className="sender-field">
          <label className="sender-label">GIF</label>
          {value.gifUrl ? (
            <div className="sender-media-row">
              <div className="sender-thumb gif">
                <img src={value.gifUrl} alt="Chosen GIF" />
                <button type="button" className="sender-thumb-remove" aria-label="Remove GIF" onClick={() => update({ gifUrl: '' })}>×</button>
              </div>
            </div>
          ) : (
            <button type="button" className="sender-btn-secondary small" onClick={() => setGifOpen(true)}>
              Add a GIF
            </button>
          )}
        </div>
      )}

      {gifOpen && (
        <GifPicker
          onClose={() => setGifOpen(false)}
          onPick={(url) => {
            update({ gifUrl: url });
            setGifOpen(false);
          }}
        />
      )}

      {uploading > 0 && <span className="sender-hint">Uploading photos…</span>}
    </div>
  );
};

export default MessageComposer;
