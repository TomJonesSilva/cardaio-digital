import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/cart-context';
import { OrderProvider } from '@/context/order-context';
import { AuthProvider } from '@/context/auth-context';
import { CategoriaProvider } from '@/context/categoria-context';
import LayoutWithNavbar from '@/components/layoutWithNavbar';
import { ProdutoProvider } from '@/context/produto-context';
import { AlertProvider } from '@/context/alert-context';
import { FuncionarioProvider } from '@/context/funcionarios-context';

const geistSans = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tempero de Mainha',
  description: 'Restaurante de almoço e lanches',
  generator: 'tom jones',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.className} bg-gray-50`}>
        {/* ✅ O AlertProvider precisa estar por fora de tudo */}
        <AlertProvider>
          <AuthProvider>
            <CartProvider>
              <OrderProvider>
                <CategoriaProvider>
                  <ProdutoProvider>
                    <FuncionarioProvider>
                      <LayoutWithNavbar>{children}</LayoutWithNavbar>
                    </FuncionarioProvider>
                  </ProdutoProvider>
                </CategoriaProvider>
              </OrderProvider>
            </CartProvider>
          </AuthProvider>
        </AlertProvider>
      </body>
    </html>
  );
}
