export default function Loading() {
  return (
    <main className="route-loading" aria-live="polite" aria-busy="true">
      <div className="route-loading-inner">
        <span className="route-loading-mark">LOLA</span>
        <div className="route-loading-line" />
        <span className="route-loading-copy">Curating your edit</span>
      </div>
    </main>
  );
}
