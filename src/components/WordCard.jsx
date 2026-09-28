import { useState } from 'react';

export default function WordCard({ item, onDelete }) {
  // Each card has its own independent reveal state.
  const [revealed, setRevealed] = useState(false);

  return (
    <article className="card">
      <button className="card-toggle" type="button"
        aria-expanded={revealed}
        aria-label={`${revealed ? 'Hide' : 'Show'} meaning of ${item.word}`}
        onClick={() => setRevealed((current) => !current)}>
        <span className="card-word">{item.word}</span>
        {(item.pronunciation || item.partOfSpeech) && (
          <span className="word-details">
            {item.pronunciation} {item.partOfSpeech}
          </span>
        )}
        {revealed ? (
          <span className="card-meaning">{item.meaning}</span>
        ) : (
          <span className="reveal-hint">Click to reveal meaning</span>
        )}
        {item.example && <span className="word-example">{item.example}</span>}
        {revealed && <span className="reveal-hint">Click to hide meaning</span>}
      </button>
      <div className="card-footer">
        <button className="delete-button" type="button"
          aria-label={`Delete ${item.word}`} onClick={() => onDelete(item.id)}>
          Delete
        </button>
      </div>
    </article>
  );
}
