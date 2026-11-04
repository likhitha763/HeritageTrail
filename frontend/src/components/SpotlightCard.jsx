export default function SpotlightCard({ as: Element = 'div', className = '', children, ...props }) {
  function moveSpotlight(event) {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--spotlight-x', `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty('--spotlight-y', `${event.clientY - bounds.top}px`);
    event.currentTarget.style.setProperty('--spotlight-opacity', '1');
  }

  function hideSpotlight(event) {
    event.currentTarget.style.setProperty('--spotlight-opacity', '0');
  }

  function focusSpotlight(event) {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--spotlight-x', `${bounds.width / 2}px`);
    event.currentTarget.style.setProperty('--spotlight-y', `${bounds.height / 2}px`);
    event.currentTarget.style.setProperty('--spotlight-opacity', '1');
  }

  return (
    <Element
      className={`spotlight-card${className ? ` ${className}` : ''}`}
      onPointerMove={moveSpotlight}
      onPointerLeave={hideSpotlight}
      onFocus={focusSpotlight}
      onBlur={hideSpotlight}
      {...props}
    >
      {children}
      <span className="spotlight-card-glow" aria-hidden="true" />
    </Element>
  );
}
