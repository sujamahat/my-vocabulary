import WordCard from './WordCard.jsx';

export default function WordList({ words, onDelete }) {
  return words.length > 0 ? (
    <div className="word-list">
      {words.map((item) => (
        <WordCard key={item.id} item={item} onDelete={onDelete} />
      ))}
    </div>
  ) : (
    <p className="empty-state" lang="ko">단어를 추가해보세요</p>
  );
}
