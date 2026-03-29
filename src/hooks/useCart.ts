"use client";

import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { CartItem, Product } from "@/lib/types";

export function useCart() {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    const cartRef = doc(db, "carts", user.uid);
    const cartSnap = await getDoc(cartRef);
    if (cartSnap.exists()) {
      setItems(cartSnap.data().items || []);
    } else {
      setItems([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const saveCart = async (newItems: CartItem[]) => {
    if (!user) return;
    setItems(newItems);
    await setDoc(doc(db, "carts", user.uid), {
      items: newItems,
      updatedAt: new Date(),
    });
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    const existing = items.find((item) => item.productId === product.id);
    let newItems: CartItem[];
    if (existing) {
      newItems = items.map((item) =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newItems = [
        ...items,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
          imageUrl: product.imageUrl,
        },
      ];
    }
    await saveCart(newItems);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    const newItems = items.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );
    await saveCart(newItems);
  };

  const removeFromCart = async (productId: string) => {
    const newItems = items.filter((item) => item.productId !== productId);
    await saveCart(newItems);
  };

  const clearCart = async () => {
    await saveCart([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    items,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
    refetch: fetchCart,
  };
}
