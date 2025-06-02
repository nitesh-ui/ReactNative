import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

type CurrencyContextType = {
  convertAmount: (amount: number, from: string, to: string) => Promise<number>;
  rates: Record<string, number>;
  loading: boolean;
  error: string | null;
  getDefaultAmount: (countryCode: string) => number;
};

type CountryCode = 'IN' | 'US' | 'CH' | 'JP';

const currencyMap: Record<CountryCode, string> = {
  IN: 'INR',
  US: 'USD',
  CH: 'CNY',
  JP: 'JPY',
};

// Default bet amounts in INR
const defaultAmounts: Record<CountryCode, number> = {
  IN: 30, // ₹30
  US: 30, // ~$0.36
  CH: 30, // ~¥2.6
  JP: 30, // ~¥4.2
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const baseRates: Record<string, number> = {};

        // Using INR as base currency
        const response = await axios.get('https://open.er-api.com/v6/latest/INR');

        const apiRates = response.data.rates;

        // Calculate rates for all currency pairs
        for (const [fromCode, fromCurrency] of Object.entries(currencyMap)) {
          for (const [toCode, toCurrency] of Object.entries(currencyMap)) {
            if (fromCode !== toCode) {
              // Convert through INR as base
              const fromRate = fromCurrency === 'INR' ? 1 : apiRates[fromCurrency];
              const toRate = toCurrency === 'INR' ? 1 : apiRates[toCurrency];
              const rate = toRate / fromRate;
              baseRates[`${fromCode}-${toCode}`] = rate;
            }
          }
        }

        setRates(baseRates);
        setError(null);
      } catch (err) {
        setError('Failed to fetch currency rates');
        console.error('Currency conversion error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
    // Refresh rates every hour
    const interval = setInterval(fetchRates, 3600000);
    return () => clearInterval(interval);
  }, []);

  const convertAmount = async (amount: number, from: string, to: string): Promise<number> => {
    if (from === to) return amount;

    try {
      const fromCurrency = currencyMap[from as CountryCode];
      const toCurrency = currencyMap[to as CountryCode];

      if (!fromCurrency || !toCurrency) {
        throw new Error(`Invalid currency code: ${!fromCurrency ? from : to}`);
      }

      const rateKey = `${from}-${to}`;
      const rate = rates[rateKey];

      if (!rate) {
        throw new Error(`No conversion rate found for ${from} to ${to}`);
      }

      // Round to 2 decimal places for most currencies, except JPY and INR which typically use whole numbers
      const converted = amount * rate;
      if (toCurrency === 'JPY' || toCurrency === 'INR') {
        return Math.round(converted);
      }
      return Math.round(converted * 100) / 100;
    } catch (err) {
      console.error('Conversion error:', err);
      throw err;
    }
  };

  // Function to get the default bet amount for a country in their local currency
  const getDefaultAmount = (countryCode: string): number => {
    const code = countryCode as CountryCode;
    if (code === 'IN') return defaultAmounts[code];

    try {
      const rateKey = `IN-${code}`;
      const rate = rates[rateKey];
      if (!rate) return defaultAmounts[code];

      // Convert the IN default amount to the target currency
      const converted = defaultAmounts.IN * rate;
      return Math.round(converted);
    } catch {
      return defaultAmounts[code];
    }
  };

  return (
    <CurrencyContext.Provider value={{ convertAmount, rates, loading, error, getDefaultAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
