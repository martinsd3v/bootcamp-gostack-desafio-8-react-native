import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsOnStorage = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (productsOnStorage) {
        setProducts(JSON.parse(productsOnStorage));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const checkProductInCard = products.find(
        checkProduct => checkProduct.id === product.id,
      );

      if (!checkProductInCard) {
        setProducts([...products, { ...product, quantity: 1 }]);

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify([...products, { ...product, quantity: 1 }]),
        );

        return;
      }

      const updatedProducts = products.map(updateProduct =>
        updateProduct.id === product.id
          ? { ...updateProduct, quantity: updateProduct.quantity + 1 }
          : updateProduct,
      );

      setProducts(updatedProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(updatedProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const incrementProducts = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity + 1 }
          : product,
      );

      setProducts(incrementProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(incrementProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const decrementProducts = products.map(product => {
        if (product.id === id) {
          if (product.quantity > 0) {
            product.quantity -= 1;
          }
        }

        return product;
      });

      setProducts(decrementProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
