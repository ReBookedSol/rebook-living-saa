import { Home } from "lucide-react";
import { Link } from "react-router-dom";

const MaintenanceLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 pointer-events-none">
              <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center">
                <Home className="text-primary-foreground w-4 h-4" />
              </div>
              <span className="text-lg font-semibold tracking-tight">Rebook Living</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Home className="w-6 h-6" />
                Rebook Living
              </h3>
              <p className="text-sm text-muted-foreground">
                Connecting South African students with quality accommodation.
              </p>
              <div className="mt-4 text-xs text-muted-foreground">Powered by Rebooked Solutions</div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Info</h4>
              <ul className="space-y-2 text-sm">
                <li className="text-muted-foreground">Coming soon</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex items-center gap-3">
                <a href="https://www.instagram.com/rebooked.living/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t mt-10 pt-6 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Rebooked Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MaintenanceLayout;
