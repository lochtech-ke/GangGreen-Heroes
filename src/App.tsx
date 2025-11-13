import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-green-700 mb-4">
            #GangGreen
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Catalyzing a Carbon-Negative Africa
          </p>
          <p className="text-sm text-gray-500">
            Wangari Maathai Hackathon - Track 3: Community Engagement and Sustainability
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Kakamega Forest
            </h3>
            <p className="text-sm text-gray-600">Primary pilot site</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Karura Forest
            </h3>
            <p className="text-sm text-gray-600">Urban conservation area</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Mau Forest
            </h3>
            <p className="text-sm text-gray-600">Critical water tower ecosystem</p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
          >
            Trees Planted: {count}
          </button>
          <p className="mt-4 text-sm text-gray-500">
            Platform setup complete. Ready for development!
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
