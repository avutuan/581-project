/**
 * ----------------------------------------------------------
 * ExportCSVButton Component
 * ----------------------------------------------------------
 * Author: Kobe Jordan
 * Last Modified: 11/23/2025
 *
 * Description:
 * This component provides CSV export functionality for transaction history.
 * It fetches the last 200 transactions and exports them in a standardized
 * CSV format with proper ISO 8601 timestamps and all required fields.
 *
 * Requirements:
 * - Export last 200 transactions as CSV (or all if less than 200)
 * - Disabled when user has zero transactions
 * - Filename: transactions-<user>-<YYYYMMDD>.csv
 * - Columns: timestamp, transaction_id, type, amount, running_balance,
 *   description, game_id
 * ----------------------------------------------------------
 */

import { useState } from 'react';
import { useSupabaseAccount } from '../../context/SupabaseAccountContext.jsx';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext.jsx';

const ExportCSVButton = () => {
  const { getTransactionsForExport, transactions } = useSupabaseAccount();
  const { currentUser } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has any transactions
  const hasTransactions = transactions.length > 0;

  /**
   * Convert array of objects to CSV string
   */
  const convertToCSV = (data, headers) => {
    const headerRow = headers.map(h => `"${h.label}"`).join(',');
    const dataRows = data.map(row => 
      headers.map(h => {
        const value = row[h.key];
        // Escape quotes and wrap in quotes
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    );
    return [headerRow, ...dataRows].join('\n');
  };

  /**
   * Format transactions data for CSV export
   * Converts transaction data to match required CSV format with proper column names
   */
  const formatTransactionsForCSV = (transactionsList) => {
    return transactionsList.map((txn) => ({
      timestamp: new Date(txn.created_at).toISOString(), // ISO 8601 format
      transaction_id: txn.id,
      type: txn.type, // debit or credit
      amount: txn.amount,
      running_balance: txn.balance_after,
      description: txn.description,
      game_id: txn.game_id || '' // nullable, empty string if null
    }));
  };

  /**
   * Generate filename with pattern: transactions-<user>-<YYYYMMDD>.csv
   */
  const generateFilename = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    
    // Use email username as user identifier (before @)
    const userIdentifier = currentUser?.email?.split('@')[0] || 'user';
    
    return `transactions-${userIdentifier}-${dateStr}.csv`;
  };

  /**
   * Handle the export button click
   * Fetches data and triggers download
   */
  const handleExportClick = async () => {
    if (!hasTransactions || isLoading) return;

    setIsLoading(true);
    try {
      // Fetch transactions from database (up to 200 or all if less)
      const exportTransactions = await getTransactionsForExport();
      
      console.log('Fetched transactions:', exportTransactions.length);
      
      if (exportTransactions.length === 0) {
        alert('No transactions to export');
        return;
      }

      // Format data for CSV
      const formattedData = formatTransactionsForCSV(exportTransactions);

      // Define CSV headers
      const headers = [
        { label: 'Timestamp', key: 'timestamp' },
        { label: 'Transaction ID', key: 'transaction_id' },
        { label: 'Type', key: 'type' },
        { label: 'Amount', key: 'amount' },
        { label: 'Running Balance', key: 'running_balance' },
        { label: 'Description', key: 'description' },
        { label: 'Game ID', key: 'game_id' }
      ];

      // Convert to CSV string
      const csvContent = convertToCSV(formattedData, headers);

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', generateFilename());
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error exporting transactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={`export-csv-button ${!hasTransactions || isLoading ? 'disabled' : ''}`}
      onClick={handleExportClick}
      disabled={!hasTransactions || isLoading}
    >
      {isLoading ? '⏳ Preparing...' : '📥 Export CSV'}
    </button>
  );
};

export default ExportCSVButton;

