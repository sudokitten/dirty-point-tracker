export default function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-page text-secondary transition-colors duration-200">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
