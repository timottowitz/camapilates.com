import { Helmet } from 'react-helmet-async';

const Store = () => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://camadepilates.com';
  const title = 'Tienda: Camas de Pilates y Accesorios';
  const desc = 'Compra camas de Pilates (Reformer) para casa y estudio. Envío en México.';

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${origin}/store`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${origin}/store`} />
      </Helmet>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">{title}</h1>

        {/* Shop sections */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Para Casa</h2>
          {/* Example Shoprocket button */}
          <a className="sr-buy-button" data-product-id="HOME-REFORMER-001">Comprar Reformer Casa</a>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Profesional</h2>
          <a className="sr-buy-button" data-product-id="PRO-REFORMER-001">Comprar Reformer Profesional</a>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Accesorios</h2>
          <a className="sr-buy-button" data-product-id="BOX-001">Comprar Box</a>
        </section>
      </div>
      {/* Shoprocket script (replace STORE_ID) */}
      <script async src="https://cdn.shoprocket.io/loader.js" data-shoprocket-store="STORE_ID"></script>
    </>
  );
};

export default Store;
