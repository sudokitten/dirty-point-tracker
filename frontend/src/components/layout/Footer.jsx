export default function Footer({ lastUpdated }) {
  return (
    <footer className="mt-12 py-6 border-t border-border-default text-center">
      <p className="text-[10px] text-muted font-medium">
        Powered by <span className="font-bold">Riot Games API</span> — Not endorsed by Riot Games
      </p>
      {lastUpdated && (
        <p className="text-[9px] text-muted mt-1">
          Last sync: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </footer>
  );
}
