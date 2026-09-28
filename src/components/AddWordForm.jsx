import { useState } from 'react';

export default function AddWordForm({ onAddWord }) {
  const [wordInput, setWordInput] = useState('');
  const [meaningInput, setMeaningInput] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    const word = wordInput.trim();
    const meaning = meaningInput.trim();
    if (!word || !meaning) {
      setError('Please enter both a word and its meaning.');
      return;
    }

    onAddWord(word, meaning);
    setWordInput('');
    setMeaningInput('');
    setError('');
  }

  return (
    <form className="add-word-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="word">Word</label>
        <input id="word" placeholder="e.g. curiosity" value={wordInput}
          onChange={(event) => setWordInput(event.target.value)} required />
      </div>
      <div className="form-field">
        <label htmlFor="meaning">Meaning</label>
        <input id="meaning" placeholder="e.g. 호기심" value={meaningInput}
          onChange={(event) => setMeaningInput(event.target.value)} required />
      </div>
      <button className="add-button" type="submit">Add word</button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}
