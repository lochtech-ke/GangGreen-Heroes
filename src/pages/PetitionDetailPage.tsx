import { Link } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { Icon } from '../components/navigation/iconMap';

export function PetitionDetailPage() {
  // TODO: Fetch petition data using id when backend service is implemented
  // const { id } = useParams<{ id: string }>();
  // const petition = await PetitionService.getPetitionById(id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/governance" className="hover:text-blue-600">
            Governance
          </Link>
          <Icon name="chevron-right" className="w-4 h-4" />
          <Link to="/governance/petitions" className="hover:text-blue-600">
            Petitions
          </Link>
          <Icon name="chevron-right" className="w-4 h-4" />
          <span className="text-gray-900">Petition Details</span>
        </nav>

        {/* Petition Header */}
        <GlassCard variant="default" className="p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  Active
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                  Feature
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Petition Title
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

          {/* Deadline */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Icon name="clock" className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-yellow-800">
                Deadline in 28 days
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="prose max-w-none mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700">
              This is a placeholder for the petition description. The actual petition content will be loaded from the database.
            </p>
          </div>

          {/* Blockchain Verification */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Icon name="shield-check" className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">
                  Verified on Polygon Blockchain
                </span>
              </div>
              <a
                href="#"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Explorer
              </a>
            </div>
          </div>
        </GlassCard>

        {/* Signature Progress */}
        <GlassCard variant="default" className="p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Signature Progress</h2>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>0 of 100 signatures</span>
              <span>0% complete</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: '0%' }} />
            </div>
          </div>

          {/* Sign Button */}
          <button className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center">
            <Icon name="pen-tool" className="w-5 h-5 mr-2" />
            Sign with Web3 Wallet
          </button>

          {/* Info */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <Icon name="info" className="w-4 h-4 inline mr-1" />
              Signing requires connecting your Web3 wallet. Your signature will be recorded on the Polygon blockchain.
            </p>
          </div>
        </GlassCard>

        {/* Signers List */}
        <GlassCard variant="default" className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Signers</h2>
          <div className="text-center py-8 text-gray-500">
            <Icon name="inbox" className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No signatures yet</p>
            <p className="text-sm mt-2">Be the first to sign this petition</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
