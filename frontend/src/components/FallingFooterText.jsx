const phrase = 'Every place has a story worth keeping.';
const highlightedWords = new Set(['story', 'keeping.']);

export default function FallingFooterText() {
  return (
    <div
      className="falling-footer-text"
      tabIndex={0}
      aria-label={`${phrase} Hover or focus to scatter the words.`}
    >
      {phrase.split(' ').map((word, index) => (
        <span
          className={`falling-footer-word${highlightedWords.has(word) ? ' highlighted' : ''}`}
          key={word}
          style={{ '--fall-index': index }}
          aria-hidden="true"
        >
          {word}
        </span>
      ))}
    </div>
  );
}
