import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

export function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-3xl">🌳</span>
            <h1 className="text-2xl font-bold text-green-700">#GangGreen</h1>
          </div>
          <div className="flex gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 border-2 border-green-600 text-green-600 hover:bg-green-50 font-semibold rounded-md transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Catalyzing a Carbon-Negative Africa
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join the movement to restore Africa's forests. Plant trees, trade carbon credits,
            and make a real impact on climate change.
          </p>
          {!isAuthenticated && (
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold rounded-lg transition-colors shadow-lg"
            >
              Start Your Journey
            </button>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-4xl mb-4">🌱</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Plant Trees</h3>
            <p className="text-gray-600">
              Participate in conservation initiatives across Kenya's key forests including
              Kakamega, Karura, and Mau Forest.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Carbon Credits</h3>
            <p className="text-gray-600">
              Trade verified carbon credits in our transparent marketplace and support
              sustainable development.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Web3 Enabled</h3>
            <p className="text-gray-600">
              Connect your wallet to donate crypto, earn NFT badges, and participate in
              blockchain-verified conservation.
            </p>
          </div>
        </div>

        {/* Pilot Forests */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Our Pilot Forests
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="font-bold text-green-700 mb-2">Kakamega Forest</h4>
              <p className="text-gray-600 text-sm">Primary pilot site for conservation</p>
            </div>
            <div className="text-center">
              <h4 className="font-bold text-green-700 mb-2">Karura Forest</h4>
              <p className="text-gray-600 text-sm">Urban conservation area</p>
            </div>
            <div className="text-center">
              <h4 className="font-bold text-green-700 mb-2">Mau Forest</h4>
              <p className="text-gray-600 text-sm">Critical water tower ecosystem</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>© 2025 Loch Tech Solutions. Built for Wangari Maathai Hackathon.</p>
        </div>
      </footer>
    </div>
  );
}
