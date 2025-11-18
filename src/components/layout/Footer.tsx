import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white text-lg font-bold mb-4">#GangGreen</h3>
            <p className="text-sm mb-4">
              Catalyzing a carbon-negative Africa through technology-driven forest conservation,
              carbon credit markets, and community engagement.
            </p>
            <p className="text-sm text-gray-400">
              Built for the Wangari Maathai Hackathon - Track 3: Community Engagement and Sustainability
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/initiatives" className="hover:text-white transition-colors">
                  Initiatives
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-white transition-colors">
                  Carbon Credits
                </Link>
              </li>
              <li>
                <Link to="/trees" className="hover:text-white transition-colors">
                  Tree Registry
                </Link>
              </li>
              <li>
                <Link to="/nft-badges" className="hover:text-white transition-colors">
                  NFT Badges
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/legal/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/legal/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/legal/cookies" className="hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/legal/tax-receipts" className="hover:text-white transition-colors">
                  Tax Receipt Policy
                </Link>
              </li>
              <li>
                <Link to="/legal/acceptable-use" className="hover:text-white transition-colors">
                  Acceptable Use
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Pilot Forests */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <h4 className="text-white font-semibold mb-4">Pilot Forests</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-white font-medium">Kakamega Forest</p>
              <p className="text-gray-400">Primary pilot site</p>
            </div>
            <div>
              <p className="text-white font-medium">Karura Forest</p>
              <p className="text-gray-400">Urban conservation area</p>
            </div>
            <div>
              <p className="text-white font-medium">Mau Forest</p>
              <p className="text-gray-400">Critical water tower ecosystem</p>
            </div>
          </div>
        </div>

        {/* Contact & Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm">
              <p className="mb-2">
                <span className="text-white font-medium">Loch Tech Solutions</span>
              </p>
              <p className="text-gray-400">
                Email:{' '}
                <a href="mailto:info@ganggreen.africa" className="hover:text-white transition-colors">
                  info@ganggreen.africa
                </a>
              </p>
            </div>
            <div className="text-sm text-gray-400">
              <p>&copy; {currentYear} Loch Tech Solutions. All rights reserved.</p>
              <p className="mt-1">Licensed under MIT License</p>
            </div>
          </div>
        </div>

        {/* Tax Deduction Notice */}
        <div className="mt-6 p-4 bg-green-900/20 border border-green-800 rounded-lg">
          <p className="text-sm text-green-300">
            <span className="font-semibold">🇰🇪 Kenyan Tax Relief:</span> Donations may be eligible for tax
            deductions under Section 15(2)(p) of the Income Tax Act.{' '}
            <Link to="/legal/tax-receipts" className="underline hover:text-white transition-colors">
              Learn more
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
