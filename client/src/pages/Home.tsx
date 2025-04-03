const Home = () => {
  return (
    <div className="min-h-screen bg-neutral-light">
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to CC Automotive</h1>
          <p className="text-xl mb-8">Quality automotive parts for all your vehicle needs</p>
          <a href="/products" className="bg-secondary hover:bg-secondary/90 text-white font-bold py-3 px-8 rounded-full inline-block">
            Browse Our Products
          </a>
        </div>
      </section>
      
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <a href="/products?category=engine" className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-neutral flex items-center justify-center p-8">
                <h3 className="text-xl font-semibold">Engine Parts</h3>
              </div>
              <div className="p-6">
                <p className="text-neutral-dark mb-4">Quality engine components for optimal performance.</p>
                <button className="text-secondary hover:underline">Browse Engine Parts</button>
              </div>
            </a>
            
            <a href="/products?category=brakes" className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-neutral flex items-center justify-center p-8">
                <h3 className="text-xl font-semibold">Brake System</h3>
              </div>
              <div className="p-6">
                <p className="text-neutral-dark mb-4">Premium brake components for reliable stopping power.</p>
                <button className="text-secondary hover:underline">Browse Brake Systems</button>
              </div>
            </a>
            
            <a href="/products?category=suspension" className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-neutral flex items-center justify-center p-8">
                <h3 className="text-xl font-semibold">Suspension</h3>
              </div>
              <div className="p-6">
                <p className="text-neutral-dark mb-4">High-quality suspension parts for a smooth ride.</p>
                <button className="text-secondary hover:underline">Browse Suspension</button>
              </div>
            </a>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="text-5xl mb-4 text-secondary">✓</div>
              <h3 className="text-xl font-semibold mb-2">Quality Parts</h3>
              <p>We offer only the highest quality OEM and aftermarket parts.</p>
            </div>
            
            <div>
              <div className="text-5xl mb-4 text-secondary">✓</div>
              <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
              <p>Our team of automotive experts is here to help you find the right parts.</p>
            </div>
            
            <div>
              <div className="text-5xl mb-4 text-secondary">✓</div>
              <h3 className="text-xl font-semibold mb-2">Fast Shipping</h3>
              <p>We offer quick delivery to get your vehicle back on the road fast.</p>
            </div>
            
            <div>
              <div className="text-5xl mb-4 text-secondary">✓</div>
              <h3 className="text-xl font-semibold mb-2">Satisfaction Guaranteed</h3>
              <p>We stand behind our products with a satisfaction guarantee.</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Shop by Vehicle</h2>
          <p className="mb-8 max-w-3xl mx-auto">Find the perfect parts for your specific vehicle. Our catalog includes parts for all major makes and models.</p>
          <a href="/products" className="bg-secondary hover:bg-secondary/90 text-white font-bold py-3 px-8 rounded-full inline-block">
            Browse All Products
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;
