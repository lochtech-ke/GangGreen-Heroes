interface AuthOptionsProps {
  onEmailAuth: () => void;
  onWeb3Auth: () => void;
}

export function AuthOptions({ onEmailAuth, onWeb3Auth }: AuthOptionsProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-green-700 mb-2 text-center">
          Choose Sign In Method
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Select how you'd like to authenticate
        </p>

        <div className="space-y-4">
          {/* Email Authentication */}
          <button
            onClick={onEmailAuth}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 rounded-lg transition-all group"
          >
            <svg
              className="w-6 h-6 text-gray-600 group-hover:text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <div className="text-left">
              <div className="font-semibold text-gray-900">Email & Password</div>
              <div className="text-sm text-gray-600">Traditional authentication</div>
            </div>
          </button>

          {/* Web3 Wallet Authentication */}
          <button
            onClick={onWeb3Auth}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 rounded-lg transition-all group"
          >
            <svg
              className="w-6 h-6 text-gray-600 group-hover:text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <div className="text-left">
              <div className="font-semibold text-gray-900">Web3 Wallet</div>
              <div className="text-sm text-gray-600">MetaMask, WalletConnect</div>
            </div>
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
