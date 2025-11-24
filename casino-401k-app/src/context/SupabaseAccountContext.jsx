import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { useSupabaseAuth } from './SupabaseAuthContext.jsx';

const SupabaseAccountContext = createContext(null);

export const SupabaseAccountProvider = ({ children }) => {
  const { currentUser } = useSupabaseAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load user profile and transactions when user changes
  useEffect(() => {
    if (!currentUser) {
      setBalance(0);
      setTransactions([]);
      setProfile(null);
      setIsReady(true);
      return;
    }

    loadAccountData();
  }, [currentUser?.id]);

  /**
   * Load user profile and recent transactions from Supabase
   */
  const loadAccountData = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);
      setBalance(profileData.current_balance);

      // Load recent transactions (last 50)
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactionsError) throw transactionsError;

      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading account data:', error);
    } finally {
      setLoading(false);
      setIsReady(true);
    }
  };

  /**
   * Debit tokens from user account (place a bet)
   */
  const debit = useCallback(
    async (amount, description) => {
      if (!currentUser) {
        throw new Error('You need to be logged in to manage tokens.');
      }

      if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
        throw new Error('Bet amount must be greater than zero.');
      }

      if (amount > balance) {
        throw new Error('Insufficient 401k tokens for that bet.');
      }

      setLoading(true);
      try {
        const newBalance = balance - amount;

        // Insert transaction
        const { data: transaction, error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: currentUser.id,
            type: 'debit',
            amount,
            balance_after: newBalance,
            description
          })
          .select()
          .single();

        if (transactionError) throw transactionError;

        // Update profile balance
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            current_balance: newBalance,
            total_wagered: profile.total_wagered + amount
          })
          .eq('id', currentUser.id);

        if (updateError) throw updateError;

        // Update local state
        setBalance(newBalance);
        setTransactions((prev) => [transaction, ...prev].slice(0, 50));
        setProfile((prev) => ({
          ...prev,
          current_balance: newBalance,
          total_wagered: prev.total_wagered + amount
        }));

        return transaction;
      } catch (error) {
        console.error('Debit error:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentUser, balance, profile]
  );

  /**
   * Credit tokens to user account (win a bet)
   */
  const credit = useCallback(
    async (amount, description) => {
      if (!currentUser) {
        throw new Error('You need to be logged in to manage tokens.');
      }

      if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
        throw new Error('Credit amount must be greater than zero.');
      }

      setLoading(true);
      try {
        const newBalance = balance + amount;

        // Insert transaction
        const { data: transaction, error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: currentUser.id,
            type: 'credit',
            amount,
            balance_after: newBalance,
            description
          })
          .select()
          .single();

        if (transactionError) throw transactionError;

        // Update profile balance
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            current_balance: newBalance,
            total_won: profile.total_won + amount
          })
          .eq('id', currentUser.id);

        if (updateError) throw updateError;

        // Update local state
        setBalance(newBalance);
        setTransactions((prev) => [transaction, ...prev].slice(0, 50));
        setProfile((prev) => ({
          ...prev,
          current_balance: newBalance,
          total_won: prev.total_won + amount
        }));

        return transaction;
      } catch (error) {
        console.error('Credit error:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentUser, balance, profile]
  );

  /**
   * Record a game session (for history and analytics)
   */
  const recordGameSession = useCallback(
    async (gameType, betAmount, payoutAmount, result, details = {}, rngSeed = null) => {
      if (!currentUser) {
        throw new Error('You need to be logged in to record game sessions.');
      }

      try {
        const { data, error } = await supabase.from('game_sessions').insert({
          user_id: currentUser.id,
          game_type: gameType,
          bet_amount: betAmount,
          payout_amount: payoutAmount,
          result,
          details,
          rng_seed: rngSeed
        });

        if (error) throw error;

        // Update games played count
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            games_played: profile.games_played + 1
          })
          .eq('id', currentUser.id);

        if (updateError) throw updateError;

        setProfile((prev) => ({
          ...prev,
          games_played: prev.games_played + 1
        }));

        return data;
      } catch (error) {
        console.error('Error recording game session:', error);
        throw error;
      }
    },
    [currentUser, profile]
  );

  /**
   * Get game history for current user
   */
  const getGameHistory = useCallback(
    async (gameType = null, limit = 20) => {
      if (!currentUser) return [];

      try {
        let query = supabase
          .from('game_sessions')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (gameType) {
          query = query.eq('game_type', gameType);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching game history:', error);
        return [];
      }
    },
    [currentUser]
  );

  /**
   * Get last 200 transactions for CSV export
   */
  const getTransactionsForExport = useCallback(
    async () => {
      if (!currentUser) return [];

      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(200);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching transactions for export:', error);
        return [];
      }
    },
    [currentUser]
  );

  /**
   * Reset account to initial balance (for demo/testing)
   * In production, you might want to restrict this
   */
  const resetAccount = useCallback(async () => {
    if (!currentUser) {
      throw new Error('You need to be logged in to reset account.');
    }

    setLoading(true);
    try {
      const initialBalance = 401000;

      // Create reset transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: currentUser.id,
          type: 'credit',
          amount: initialBalance,
          balance_after: initialBalance,
          description: 'Account reset - Initial satirical 401k deposit'
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Reset profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          current_balance: initialBalance,
          total_wagered: 0,
          total_won: 0,
          games_played: 0
        })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      // Reload account data
      await loadAccountData();
    } catch (error) {
      console.error('Reset error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const value = useMemo(
    () => ({
      balance,
      transactions,
      profile,
      debit,
      credit,
      recordGameSession,
      getGameHistory,
      getTransactionsForExport,
      resetAccount,
      isReady: Boolean(currentUser) ? isReady : true,
      loading
    }),
    [
      balance,
      transactions,
      profile,
      debit,
      credit,
      recordGameSession,
      getGameHistory,
      getTransactionsForExport,
      resetAccount,
      isReady,
      loading,
      currentUser
    ]
  );

  return <SupabaseAccountContext.Provider value={value}>{children}</SupabaseAccountContext.Provider>;
};

export const useSupabaseAccount = () => {
  const context = useContext(SupabaseAccountContext);
  if (!context) {
    throw new Error('useSupabaseAccount must be used within a SupabaseAccountProvider');
  }
  return context;
};

