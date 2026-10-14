import { CartProvider } from './context/CartContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { WhatsAppFloat } from './components/layout/WhatsAppFloat';
import { CartDrawer } from './components/cart/CartDrawer';
import { CartToast } from './components/cart/CartToast';
import { Hero } from './components/sections/Hero';
import { TrustBar } from './components/sections/TrustBar';
import { Collection } from './components/sections/Collection';
import { About } from './components/sections/About';
import { HowToOrder } from './components/sections/HowToOrder';
import { HairCare } from './components/sections/HairCare';
import { Testimonials } from './components/sections/Testimonials';
import { Faq } from './components/sections/Faq';
import { Contact } from './components/sections/Contact';

export default function App() {
  return (
    <CartProvider>
      <a className="skip-link" href="#collection">
        Skip to collection
      </a>
      <Header />
      <main id="main">
        <Hero />
        <TrustBar />
        <Collection />
        <About />
        <HowToOrder />
        <HairCare />
        <Testimonials />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <CartDrawer />
      <CartToast />
      <WhatsAppFloat />
    </CartProvider>
  );
}
