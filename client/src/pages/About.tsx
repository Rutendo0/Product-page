const About = () => {
  return (
    <div className="min-h-screen bg-neutral-light">
      <section className="bg-primary text-white py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold">About CC Automotive</h1>
          <p className="mt-2 text-neutral-light">Your trusted partner for quality automotive parts</p>
        </div>
      </section>
      
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Our Story</h2>
            <p className="mb-6">
              Founded in 2005, CC Automotive has grown from a small local shop to one of the leading 
              suppliers of automotive parts in the region. Our journey began with a simple mission: 
              to provide high-quality automotive parts at fair prices with exceptional customer service.
            </p>
            <p className="mb-6">
              Over the years, we've expanded our inventory to include a comprehensive range of parts 
              for all major vehicle makes and models. From engine components to braking systems, 
              suspension parts to accessories, we've got everything you need to keep your vehicle 
              running at its best.
            </p>
            <p>
              Today, CC Automotive serves thousands of customers, from DIY enthusiasts to professional 
              mechanics and auto repair shops. Our commitment to quality and customer satisfaction 
              remains at the heart of everything we do.
            </p>
          </div>
        </div>
      </section>
      
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-neutral-light p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Quality</h3>
                <p>
                  We never compromise on quality. Every product in our inventory is carefully 
                  selected to ensure it meets our high standards for performance and durability.
                </p>
              </div>
              
              <div className="bg-neutral-light p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Integrity</h3>
                <p>
                  We believe in honest business practices. Our pricing is transparent, and we 
                  always provide accurate information about our products.
                </p>
              </div>
              
              <div className="bg-neutral-light p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Customer Focus</h3>
                <p>
                  Our customers are at the center of everything we do. We strive to exceed 
                  expectations with exceptional service and support.
                </p>
              </div>
              
              <div className="bg-neutral-light p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Innovation</h3>
                <p>
                  We continuously look for ways to improve our products and services, staying 
                  ahead of industry trends and technologies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Our Team</h2>
            <p className="mb-8">
              Our team consists of automotive enthusiasts and industry experts who are passionate 
              about helping customers find the right parts for their vehicles. From our product 
              specialists to our customer service representatives, everyone at CC Automotive is 
              committed to providing you with the best possible experience.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-32 h-32 bg-neutral rounded-full mx-auto mb-4"></div>
                <h3 className="font-semibold">John Smith</h3>
                <p className="text-sm text-neutral-dark">Founder & CEO</p>
              </div>
              
              <div className="text-center">
                <div className="w-32 h-32 bg-neutral rounded-full mx-auto mb-4"></div>
                <h3 className="font-semibold">Sarah Johnson</h3>
                <p className="text-sm text-neutral-dark">Product Manager</p>
              </div>
              
              <div className="text-center">
                <div className="w-32 h-32 bg-neutral rounded-full mx-auto mb-4"></div>
                <h3 className="font-semibold">Mike Davis</h3>
                <p className="text-sm text-neutral-dark">Technical Expert</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
