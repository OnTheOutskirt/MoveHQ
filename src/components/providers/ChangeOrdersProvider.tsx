"use client";

import { defaultChangeOrdersStore } from "@/lib/moves/change-orders-defaults";
import {
  createChangeOrderFromInput,
  loadChangeOrdersStore,
  saveChangeOrdersStore,
} from "@/lib/moves/change-orders-storage";
import type { ChangeOrder, NewChangeOrder } from "@/lib/moves/change-orders-types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ChangeOrdersContextValue = {
  isReady: boolean;
  orders: ChangeOrder[];
  addOrder: (input: NewChangeOrder) => ChangeOrder;
  updateOrder: (id: string, patch: Partial<ChangeOrder>) => void;
  getOrderById: (id: string) => ChangeOrder | undefined;
};

const ChangeOrdersContext = createContext<ChangeOrdersContextValue | null>(null);

export function ChangeOrdersProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState(defaultChangeOrdersStore);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setStore(loadChangeOrdersStore());
    setIsReady(true);
  }, []);

  const addOrder = useCallback((input: NewChangeOrder) => {
    const order = createChangeOrderFromInput(input);
    setStore((prev) => {
      const next = { orders: [order, ...prev.orders] };
      saveChangeOrdersStore(next);
      return next;
    });
    return order;
  }, []);

  const updateOrder = useCallback((id: string, patch: Partial<ChangeOrder>) => {
    setStore((prev) => {
      const next = {
        orders: prev.orders.map((o) =>
          o.id === id ? { ...o, ...patch, updatedAt: new Date().toISOString() } : o,
        ),
      };
      saveChangeOrdersStore(next);
      return next;
    });
  }, []);

  const getOrderById = useCallback(
    (id: string) => store.orders.find((o) => o.id === id),
    [store.orders],
  );

  const value = useMemo(
    () => ({
      isReady,
      orders: store.orders,
      addOrder,
      updateOrder,
      getOrderById,
    }),
    [isReady, store.orders, addOrder, updateOrder, getOrderById],
  );

  return (
    <ChangeOrdersContext.Provider value={value}>{children}</ChangeOrdersContext.Provider>
  );
}

export function useChangeOrders() {
  const ctx = useContext(ChangeOrdersContext);
  if (!ctx) throw new Error("useChangeOrders must be used within ChangeOrdersProvider");
  return ctx;
}
