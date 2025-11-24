import { Link } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { Icon } from '../components/navigation/iconMap';

export function ProposalDetailPage() {
  // TODO: Fetch proposal data using id when backend service is implemented
  // const { id } = useParams<{ id: string }>();
  // const proposal = await ProposalService.getProposalById(id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/governance" className="hover:text-green-600">
            Governance
          </Link>
          <Icon name="chevron-right" className="w-4 h-4" />
          <Link to="/governance/proposals" className="hover:text-green-600">
            Proposals
          </Link>
          <Icon name="chevron-right" className="w-4 h-4" />
          <span className="text-gray-900">Proposal Details</span>
        </nav>

        {/* Proposal Header */}
        <GlassCard variant="default" className="p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Active
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  Feature
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Proposal Title
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Icon name="user" className="w-4 h-4 mr-1" />
                  Created by User Name
                </span>
                <span className="flex items-center">
                  <Icon name="calendar" className="w-4 h-4 mr-1" />
                  Created 2 days ago
                </span>
              </div>
            </div>
          </div>

          {/* Voting Deadline */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Icon name="clock" className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-yellow-800">
                Voting ends in 5 days, 3 hours
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="prose max-w-none mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700">
              This is a placeholder for the proposal description. The actual proposal content will be loaded from the database.
            </p>
          </div>
        </GlassCard>

        {/* Voting Section */}
        <GlassCard variant="default" className="p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Cast Your Vote</h2>
          
          {/* Vote Distribution */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Vote Distribution</span>
              <span>0 total votes</span>
            </div>
            <div className="h-8 bg-gray-200 rounded-lg overflow-hidden flex">
              <div className="bg-green-500 h-full" style={{ width: '0%' }} />
              <div className="bg-red-500 h-full" style={{ width: '0%' }} />
              <div className="bg-gray-400 h-full" style={{ width: '0%' }} />
            </div>
            <div className="flex items-center justify-between mt-2 text-sm">
              <span className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                For: 0 (0%)
              </span>
              <span className="flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                Against: 0 (0%)
              </span>
              <span className="flex items-center">
                <span className="w-3 h-3 bg-gray-400 rounded-full mr-2" />
                Abstain: 0 (0%)
              </span>
            </div>
          </div>

          {/* Voting Buttons */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
              Vote For
            </button>
            <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
              Vote Against
            </button>
            <button className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium">
              Abstain
            </button>
          </div>

          {/* Voting Power Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">Your voting power:</span>
              <span className="text-lg font-bold text-blue-900">0 tokens</span>
            </div>
          </div>
        </GlassCard>

        {/* Voting History */}
        <GlassCard variant="default" className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Voting History</h2>
          <div className="text-center py-8 text-gray-500">
            <Icon name="inbox" className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No votes cast yet</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
