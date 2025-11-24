import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { Icon } from '../components/navigation/iconMap';

export function GovernancePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'proposals' | 'petitions'>('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Governance</h1>
          <p className="text-lg text-gray-600">
            Shape the future of #GangGreen through democratic decision-making
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('proposals')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'proposals'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Proposals
          </button>
          <button
            onClick={() => setActiveTab('petitions')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'petitions'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Petitions
          </button>
        </div>

        {/* Content */}
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'proposals' && <ProposalsTab />}
        {activeTab === 'petitions' && <PetitionsTab />}
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Token Balance Card */}
      <GlassCard variant="default" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Your Governance Tokens</h2>
          <Icon name="coins" className="w-8 h-8 text-green-600" />
        </div>
        <div className="flex items-baseline space-x-2 mb-4">
          <span className="text-5xl font-bold text-green-600">0</span>
          <span className="text-xl text-gray-600">tokens</span>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Earn governance tokens by planting trees, creating initiatives, and participating in community activities.
        </p>
        <Link
          to="/governance/earn"
          className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
        >
          Learn how to earn tokens
          <Icon name="arrow-right" className="w-4 h-4 ml-2" />
        </Link>
      </GlassCard>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard variant="default" className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <Link to="/governance/proposals/create" className="block">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon name="file-plus" className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Proposal</h3>
            <p className="text-sm text-gray-600">
              Submit a new proposal for community voting
            </p>
          </Link>
        </GlassCard>

        <GlassCard variant="default" className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <Link to="/governance/petitions/create" className="block">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="pen-tool" className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Petition</h3>
            <p className="text-sm text-gray-600">
              Gather community support with blockchain signatures
            </p>
          </Link>
        </GlassCard>

        <GlassCard variant="default" className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <Link to="/governance/delegate" className="block">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Icon name="users" className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delegate Voting</h3>
            <p className="text-sm text-gray-600">
              Delegate your voting power to a trusted representative
            </p>
          </Link>
        </GlassCard>
      </div>

      {/* Active Proposals Requiring Vote */}
      <GlassCard variant="default" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Active Proposals</h2>
          <Link
            to="/governance/proposals"
            className="text-green-600 hover:text-green-700 font-medium text-sm"
          >
            View all
          </Link>
        </div>
        <div className="text-center py-12 text-gray-500">
          <Icon name="inbox" className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No active proposals at the moment</p>
          <p className="text-sm mt-2">Check back later or create your own proposal</p>
        </div>
      </GlassCard>
    </div>
  );
}

function ProposalsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Proposals</h2>
          <p className="text-gray-600 mt-1">Vote on platform features and improvements</p>
        </div>
        <Link
          to="/governance/proposals/create"
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Icon name="plus" className="w-5 h-5 mr-2" />
          Create Proposal
        </Link>
      </div>

      {/* Filters */}
      <GlassCard variant="default" className="p-4">
        <div className="flex flex-wrap gap-4">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option>All Categories</option>
            <option>Feature</option>
            <option>Improvement</option>
            <option>Policy</option>
            <option>Other</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option>All Status</option>
            <option>Active</option>
            <option>Passed</option>
            <option>Rejected</option>
            <option>Pending</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option>Sort by: Recent</option>
            <option>Sort by: Ending Soon</option>
            <option>Sort by: Most Votes</option>
          </select>
        </div>
      </GlassCard>

      {/* Proposal List */}
      <div className="text-center py-12 text-gray-500">
        <Icon name="inbox" className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium">No proposals yet</p>
        <p className="text-sm mt-2">Be the first to create a proposal and shape the platform's future</p>
      </div>
    </div>
  );
}

function PetitionsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Petitions</h2>
          <p className="text-gray-600 mt-1">Support community initiatives with blockchain signatures</p>
        </div>
        <Link
          to="/governance/petitions/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Icon name="plus" className="w-5 h-5 mr-2" />
          Start Petition
        </Link>
      </div>

      {/* Filters */}
      <GlassCard variant="default" className="p-4">
        <div className="flex flex-wrap gap-4">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>All Categories</option>
            <option>Feature</option>
            <option>Improvement</option>
            <option>Policy</option>
            <option>Urgent</option>
            <option>Other</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>All Status</option>
            <option>Active</option>
            <option>Successful</option>
            <option>Failed</option>
            <option>Converted</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>Sort by: Recent</option>
            <option>Sort by: Ending Soon</option>
            <option>Sort by: Most Signatures</option>
          </select>
        </div>
      </GlassCard>

      {/* Petition List */}
      <div className="text-center py-12 text-gray-500">
        <Icon name="inbox" className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium">No petitions yet</p>
        <p className="text-sm mt-2">Start a petition to gather community support for important issues</p>
      </div>
    </div>
  );
}
