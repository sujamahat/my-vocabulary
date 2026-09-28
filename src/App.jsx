import { useEffect, useState } from "react";
import { WORDS } from "./data/words.js";
import WordList from "./components/WordList.jsx";
import AddWordForm from "./components/AddWordForm.jsx";
import RecommendedWords from "./components/RecommendedWords.jsx";

const API_BASE = (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/+$/, "");

export default function App() {
  const [words, setWords] = useState(WORDS);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    // The effect itself stays synchronous; this inner function can use await.
    async function run() {
      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const res = await fetch(`${API_BASE}/api/words/serendipity`, {
          signal: controller.signal,
        });
        if (res.status === 404) {
          throw new Error("사전에서 찾을 수 없는 단어입니다. 철자를 확인해 주세요.");
        }
        if (!res.ok) {
          throw new Error(`API 요청에 실패했습니다. (${res.status}) 미니 API 서버를 확인해 주세요.`);
        }

        const json = await res.json();
        // Our mini API returns one word object, not an array.
        if (!controller.signal.aborted) setResult(json);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof TypeError
            ? "단어를 불러올 수 없습니다. 네트워크와 미니 API 서버를 확인한 뒤 새로고침해 주세요."
            : err.message);
        }
      } finally {
        // A cancelled request must not change the next request's loading state.
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    run();

    // Cancel the request when this component is removed.
    return () => controller.abort();
  }, []);

  function handleAddWord(word, meaning) {
    const newWord = {
      id: crypto.randomUUID(),
      word,
      meaning,
      pronunciation: "",
      partOfSpeech: "",
      example: "",
    };

    setWords((currentWords) => [...currentWords, newWord]);
  }

  function handleDelete(id) {
    // filter creates a new array and leaves the original vocabulary untouched.
    setWords((currentWords) => currentWords.filter((item) => item.id !== id));
  }

  return (
    <main className="vocabulary-app">
      <header className="app-header">
        <p className="eyebrow">A LITTLE PRACTICE, EVERY DAY</p>
        <h1>My Vocabulary App</h1>
        <p>Add a word, reveal its meaning, and keep learning.</p>
        <div aria-live="polite">
          {loading ? (
            <p>🔍 찾는 중…</p>
          ) : error ? (
            <p role="alert">{error}</p>
          ) : result ? (
            <p>Featured word: <strong>{result.word}</strong> — {result.meaning}</p>
          ) : null}
        </div>
      </header>
      <AddWordForm onAddWord={handleAddWord} />
      <section aria-labelledby="vocabulary-heading">
        <div className="list-header">
          <h2 id="vocabulary-heading">Your vocabulary</h2>
          <span className="word-count" aria-live="polite">
            {words.length} words
          </span>
        </div>
        <WordList words={words} onDelete={handleDelete} />
      </section>
      <RecommendedWords />
    </main>
  );
}
