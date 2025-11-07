/**
 * ----------------------------------------------------------
 * WalletPage Component
 * ----------------------------------------------------------
 * Author: Changwen Gong
 * Last Modified: 2025/11/7
 *
 * Description:
 * This is the main page component for the Wallet feature. It serves
 * as a simple wrapper that renders the WalletPanel component within
 * the standard page layout structure.
 *
 * The page displays the user's financial dashboard including their
 * current balance, wagering statistics, and transaction history.
 *
 * Basically, this is the wallet route page that holds the wallet UI.
 * ----------------------------------------------------------
 */

import WalletPanel from '../components/wallet/WalletPanel.jsx';

const WalletPage = () => {
  return (
    // Standard page container with wallet-specific class for styling
    <div className="page wallet-page">
      {/* Render the main wallet panel component */}
      <WalletPanel />
    </div>
  );
};

export default WalletPage;
