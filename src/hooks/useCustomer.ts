import { useState } from 'react';

export interface CustomerSession {
  customer_id: string;
  name: string;
  phone: string;
  location: string;
}

const STORAGE_KEY = 'tg_customer';

export function useCustomer() {
  const [customer, setCustomerState] = useState<CustomerSession | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const saveCustomer = (data: CustomerSession) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
    setCustomerState(data);
  };

  const clearCustomer = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setCustomerState(null);
  };

  return { customer, saveCustomer, clearCustomer };
}
