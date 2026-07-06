import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  // items: [{ listing, quantity }]

  const addToCart = (listing, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.listing.id === listing.id);
      if (existing) {
        return prev.map((i) =>
          i.listing.id === listing.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { listing, quantity }];
    });
  };

  const removeFromCart = (listingId) => {
    setItems((prev) => prev.filter((i) => i.listing.id !== listingId));
  };

  const updateQuantity = (listingId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(listingId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => i.listing.id === listingId ? { ...i, quantity } : i)
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce(
    (sum, i) => sum + parseFloat(i.listing.price) * i.quantity, 0
  );

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalAmount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);