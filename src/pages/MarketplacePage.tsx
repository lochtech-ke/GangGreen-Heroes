import { useState } from 'react';
import { Search, Wallet, ExternalLink } from 'lucide-react';

// Project data based on the design
const PROJECTS = [
  {
    id: 1,
    name: 'Kakamega Forest Reforestation',
    location: 'Kakamega, Kenya',
    description: 'Restoring indigenous rainforest with native species',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&q=80',
    creditType: '1 ton CO₂/credit',
    available: 500,
    priceEth: 0.0150,
    priceUsd: 25,
    verification: 'Verified by Verra',
    verificationColor: 'bg-green-100 text-green-700',
    category: 'Reforestation'
  },
  {
    id: 2,
    name: 'Solar Energy Expansion Kenya',
    location: 'Nairobi, Kenya',
    description: 'Community solar power reducing fossil fuel dependency',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&q=80',
    creditType: '0.8 ton CO₂/credit',
    available: 750,
    priceEth: 0.0120,
    priceUsd: 20,
    verification: 'Verified by Gold Standard',
    verificationColor: 'bg-amber-100 text-amber-700',
    category: 'Renewable'
  },
  {
    id: 3,
    name: 'Wind Farm Initiative',
    location: 'Turkana, Kenya',
    description: 'Large-scale wind energy project in northern Kenya',
    image: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=500&q=80',
    creditType: '1.2 ton CO₂/credit',
    available: 300,
    priceEth: 0.0180,
    priceUsd: 30,
    verification: 'Verified by Verra',
    verificationColor: 'bg-green-100 text-green-700',
    category: 'Renewable'
  },
  {
    id: 4,
    name: 'Coastal Ocean Conservation',
    location: 'Mombasa, Kenya',
    description: 'Coral reef restoration and marine ecosystem protection',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&q=80',
    creditType: '1.5 ton CO₂/credit',
    available: 200,
    priceEth: 0.0220,
    priceUsd: 35,
    verification: 'Verified by Blue Carbon',
    verificationColor: 'bg-blue-100 text-blue-700',
    category: 'Ocean'
  },
];

// Recent transactions based on the design
const RECENT_TRANSACTIONS = [
  {
    id: 1,
    name: 'Environmental Fund',
    amount: '-0.05 ETH',
    amountUsd: '$106.73',
    time: '2 hours ago',
    hash: '0x1D2...c344',
    status: 'confirmed',
    icon: '💜',
    iconBg: 'bg-purple-100'
  },
  {
    id: 2,
    name: 'Kakamega Carbon Credits',
    amount: '-0.015 ETH',
    amountUsd: '$32.02',
    time: '1 day ago',
    hash: '0x56F...7g8h',
    status: 'confirmed',
    icon: '🛒',
    iconBg: 'bg-blue-100'
  },
  {
    id: 3,
    name: 'Solar Energy Credits',
    amount: '-0.024 ETH',
    amountUsd: '$51.23',
    time: '3 days ago',
    hash: '0x91g...k112',
    status: 'confirmed',
    icon: '🛒',
    iconBg: 'bg-blue-100'
  },
  {
    id: 4,
    name: 'Tree Planting Fund',
    amount: '-50.00 USDC',
    amountUsd: '$50.00',
    time: '5 days ago',
    hash: '0x8h3...r5p6',
    status: 'confirmed',
    icon: '💜',
    iconBg: 'bg-purple-100'
  },
];

const FILTER_CATEGORIES = [
  { id: 'all', label: 'All', icon: '🌍' },
  { id: 'reforestation', label: 'Reforestation', icon: '🌲' },
  { id: 'renewable', label: 'Renewable', icon: '⚡' },
  { id: 'ocean', label: 'Ocean', icon: '🌊' },
  { id: 'conservation', label: 'Conservation', icon: '🦁' },
];

export function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProjects = PROJECTS.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' ||
                           project.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Impact Marketplace</h1>
          <p className="text-gray-600">Trade verified carbon credits and support environmental projects</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search initiatives, trees, achievements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3">
            {FILTER_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-green-700 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                <span>{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Verified Credits Info Banner */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-green-900 mb-1">Verified Carbon Credits</h3>
          <p className="text-sm text-green-700">
            All credits are blockchain-verified and independently audited
          </p>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No projects found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="lg:w-96 space-y-6">
        {/* Crypto Donations Widget */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Crypto Donations (Web3)</h3>

          <div className="bg-yellow-50 rounded-lg p-4 mb-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Wallet className="w-5 h-5 text-yellow-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 mb-1">Connect Your Wallet</p>
              <p className="text-xs text-gray-600">
                Connect your Web3 wallet to make crypto donations and purchase carbon credits
              </p>
            </div>
          </div>

          <button className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </button>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Transactions</h3>

          <div className="space-y-3">
            {RECENT_TRANSACTIONS.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>

          <button className="w-full mt-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            View Full Transaction History
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {/* Impact Transparency Card */}
        <div className="bg-gradient-to-br from-green-700 to-green-800 rounded-xl shadow-sm p-6 text-white">
          <h3 className="font-semibold mb-3">Impact Transparency</h3>
          <p className="text-sm text-green-50 mb-4">
            All transactions are recorded on the blockchain, ensuring full transparency and traceability of your environmental contributions.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-100">Live on Polygon Network</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Project Card Component
function ProjectCard({ project }: { project: typeof PROJECTS[0] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden">
      {/* Image */}
      <div className="relative h-48">
        <img
          src={project.image}
          alt={project.name}
          className="w-full h-full object-cover"
        />
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${project.verificationColor}`}>
          <span className="mr-1">✓</span>
          {project.verification.split(' ').slice(-1)[0]}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1">{project.name}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
              <span>📍</span>
              <span>{project.location}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">{project.description}</p>

        <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
          <span className="inline-flex items-center gap-1">
            <span>☁️</span>
            {project.creditType}
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-green-600 font-medium">
            {project.available} available
          </span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {project.priceEth} ETH
            </div>
            <div className="text-xs text-gray-600">
              ${project.priceUsd}
            </div>
          </div>
          <div className="text-xs text-gray-500">per credit</div>
        </div>

        <button className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-2.5 px-4 rounded-lg transition-colors">
          Buy Credits
        </button>
      </div>
    </div>
  );
}

// Transaction Item Component
function TransactionItem({ transaction }: { transaction: typeof RECENT_TRANSACTIONS[0] }) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-0">
      <div className={`w-10 h-10 ${transaction.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <span className="text-lg">{transaction.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-gray-900 text-sm truncate">{transaction.name}</span>
          <span className="font-semibold text-gray-900 text-sm whitespace-nowrap ml-2">
            {transaction.amount}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">{transaction.time}</span>
          <span className="text-xs text-gray-600">{transaction.amountUsd}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500 font-mono">{transaction.hash}</span>
          <span className="text-xs text-green-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
            {transaction.status}
          </span>
        </div>
      </div>
    </div>
  );
}
