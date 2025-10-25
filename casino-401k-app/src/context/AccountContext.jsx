import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { useAuth } from './AuthContext.jsx';

const LEDGER_KEY_PREFIX = 'casino401k_ledger_';
const INITIAL_BALANCE = 401000;
const MAX_TRANSACTIONS = 50;

const AccountContext = createContext(null);

const createTransaction = ({ type, amount, balance, description }) => ({
  id: (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  type,
  amount,
  balance,
  description,
  timestamp: new Date().toISOString()
});

const createInitialLedger = () => {
  const initialTransaction = createTransaction({
    type: 'credit',
    amount: INITIAL_BALANCE,
    balance: INITIAL_BALANCE,
    description: 'Initial satirical 401k deposit'
  });

  return {
    balance: INITIAL_BALANCE,
    transactions: [initialTransaction]
  };
};

const ledgerReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD':
      return action.payload;
    case 'RESET':
      return createInitialLedger();
    case 'DEBIT': {
      const { amount, description } = action.payload;
      const nextBalance = state.balance - amount;
      const transaction = createTransaction({
        type: 'debit',
        amount,
        balance: nextBalance,
        description
      });
      return {
        balance: nextBalance,
        transactions: [transaction, ...state.transactions].slice(0, MAX_TRANSACTIONS)
      };
    }
    case 'CREDIT': {
      const { amount, description } = action.payload;
      const nextBalance = state.balance + amount;
      const transaction = createTransaction({
        type: 'credit',
        amount,
        balance: nextBalance,
        description
      });
      return {
        balance: nextBalance,
        transactions: [transaction, ...state.transactions].slice(0, MAX_TRANSACTIONS)
      };
    }
    default:
      return state;
  }
};

export const AccountProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [state, dispatch] = useReducer(ledgerReducer, createInitialLedger());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!currentUser?.email) {
      dispatch({ type: 'RESET' });
      setIsReady(true);
      return;
    }

    const ledgerKey = `${LEDGER_KEY_PREFIX}${currentUser.email}`;

    try {
      const storedLedger = localStorage.getItem(ledgerKey);
      if (storedLedger) {
        const parsed = JSON.parse(storedLedger);
        dispatch({ type: 'LOAD', payload: parsed });
      } else {
        const initial = createInitialLedger();
        dispatch({ type: 'LOAD', payload: initial });
        localStorage.setItem(ledgerKey, JSON.stringify(initial));
      }
    } catch (error) {
      console.error('Failed to load ledger', error);
      const fallback = createInitialLedger();
      dispatch({ type: 'LOAD', payload: fallback });
      localStorage.setItem(ledgerKey, JSON.stringify(fallback));
    } finally {
      setIsReady(true);
    }
  }, [currentUser?.email]);

  useEffect(() => {
    if (!currentUser?.email || !isReady) {
      return;
    }
    const ledgerKey = `${LEDGER_KEY_PREFIX}${currentUser.email}`;
    localStorage.setItem(ledgerKey, JSON.stringify(state));
  }, [currentUser?.email, isReady, state]);

  const ensureUserContext = () => {
    if (!currentUser?.email) {
      throw new Error('You need to be logged in to manage tokens.');
    }
  };

  const debit = useCallback((amount, description) => {
    ensureUserContext();
    if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
      throw new Error('Bet amount must be greater than zero.');
    }
    if (amount > state.balance) {
      throw new Error('Insufficient 401k tokens for that bet.');
    }
    dispatch({ type: 'DEBIT', payload: { amount, description } });
  }, [state.balance, currentUser?.email]);

  const credit = useCallback((amount, description) => {
    ensureUserContext();
    if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
      throw new Error('Credit amount must be greater than zero.');
    }
    dispatch({ type: 'CREDIT', payload: { amount, description } });
  }, [currentUser?.email]);

  const resetAccount = useCallback(() => {
    ensureUserContext();
    const initial = createInitialLedger();
    dispatch({ type: 'LOAD', payload: initial });
  }, [currentUser?.email]);

  const value = useMemo(() => ({
    balance: state.balance,
    transactions: state.transactions,
    debit,
    credit,
    resetAccount,
    isReady: Boolean(currentUser?.email) ? isReady : true
  }), [state.balance, state.transactions, debit, credit, resetAccount, isReady, currentUser?.email]);

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};
