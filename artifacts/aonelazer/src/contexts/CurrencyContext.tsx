import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rateFromINR: number;
  flag: string;
}

export const CURRENCIES: Currency[] = [
  { code: "INR", symbol: "₹", name: "Indian Rupee", rateFromINR: 1, flag: "🇮🇳" },
  { code: "USD", symbol: "$", name: "US Dollar", rateFromINR: 0.012, flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", rateFromINR: 0.011, flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", rateFromINR: 0.0094, flag: "🇬🇧" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", rateFromINR: 1.78, flag: "🇯🇵" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", rateFromINR: 0.019, flag: "🇦🇺" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", rateFromINR: 0.016, flag: "🇨🇦" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc", rateFromINR: 0.011, flag: "🇨🇭" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", rateFromINR: 0.016, flag: "🇸🇬" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", rateFromINR: 0.044, flag: "🇦🇪" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", rateFromINR: 0.045, flag: "🇸🇦" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", rateFromINR: 0.087, flag: "🇨🇳" },
  { code: "KRW", symbol: "₩", name: "South Korean Won", rateFromINR: 16.2, flag: "🇰🇷" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", rateFromINR: 0.094, flag: "🇭🇰" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", rateFromINR: 0.020, flag: "🇳🇿" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", rateFromINR: 0.056, flag: "🇲🇾" },
  { code: "THB", symbol: "฿", name: "Thai Baht", rateFromINR: 0.43, flag: "🇹🇭" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", rateFromINR: 196, flag: "🇮🇩" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", rateFromINR: 0.69, flag: "🇵🇭" },
  { code: "ZAR", symbol: "R", name: "South African Rand", rateFromINR: 0.22, flag: "🇿🇦" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", rateFromINR: 0.066, flag: "🇧🇷" },
  { code: "MXN", symbol: "$", name: "Mexican Peso", rateFromINR: 0.24, flag: "🇲🇽" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", rateFromINR: 0.13, flag: "🇳🇴" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", rateFromINR: 0.13, flag: "🇸🇪" },
  { code: "DKK", symbol: "kr", name: "Danish Krone", rateFromINR: 0.082, flag: "🇩🇰" },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrencyByCode: (code: string) => void;
  formatAmount: (amountInINR: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = "aonelazer_currency";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const found = CURRENCIES.find((c) => c.code === saved);
        if (found) return found;
      }
    } catch {}
    return CURRENCIES[0];
  });

  const setCurrencyByCode = useCallback((code: string) => {
    const found = CURRENCIES.find((c) => c.code === code);
    if (found) {
      setCurrency(found);
      try {
        localStorage.setItem(STORAGE_KEY, code);
      } catch {}
    }
  }, []);

  const formatAmount = useCallback(
    (amountInINR: number): string => {
      const converted = amountInINR * currency.rateFromINR;
      const noFraction = ["JPY", "KRW", "IDR"].includes(currency.code);
      try {
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: currency.code,
          minimumFractionDigits: noFraction ? 0 : 0,
          maximumFractionDigits: noFraction ? 0 : 0,
        }).format(converted);
      } catch {
        return `${currency.symbol}${Math.round(converted).toLocaleString()}`;
      }
    },
    [currency]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrencyByCode, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
