const Contact = () => {
  return (
    <div className="min-h-screen bg-neutral-light">
      <section className="bg-primary text-white py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold">Contact Us</h1>
          <p className="mt-2 text-neutral-light">We're here to help with all your automotive needs</p>
        </div>
      </section>
      
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="md:w-1/2 p-8 bg-primary text-white">
                <h2 className="text-2xl font-bold mb-6">Get In Touch</h2>
                <p className="mb-8">
                  Have questions about our products or services? Our team is ready to assist you.
                  Fill out the form or use our contact information below.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="text-secondary mt-1 mr-3">📍</div>
                    <div>
                      <h3 className="font-semibold">Address</h3>
                      <p>123 Auto Street, Car City, ST 12345</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="text-secondary mt-1 mr-3">📞</div>
                    <div>
                      <h3 className="font-semibold">Phone</h3>
                      <p>(123) 456-7890</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="text-secondary mt-1 mr-3">✉️</div>
                    <div>
                      <h3 className="font-semibold">Email</h3>
                      <p>info@ccautomotive.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="text-secondary mt-1 mr-3">🕒</div>
                    <div>
                      <h3 className="font-semibold">Business Hours</h3>
                      <p>Monday - Friday: 9am - 6pm<br />Saturday: 10am - 4pm<br />Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/2 p-8">
                <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                <form>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-3 py-2 border border-neutral rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-3 py-2 border border-neutral rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                      placeholder="Your email"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      className="w-full px-3 py-2 border border-neutral rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                      placeholder="Subject"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full px-3 py-2 border border-neutral rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                      placeholder="Your message"
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="bg-secondary hover:bg-secondary/90 text-white font-bold py-2 px-6 rounded-md"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="bg-neutral-light p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">How do I find the right part for my vehicle?</h3>
                <p>
                  You can use our vehicle selector tool on the products page to find parts compatible with your specific make and model.
                  If you need assistance, our customer service team is always ready to help.
                </p>
              </div>
              
              <div className="bg-neutral-light p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">What is your return policy?</h3>
                <p>
                  We offer a 30-day return policy for most items. Products must be in original packaging and unused condition.
                  Please contact our customer service team to initiate a return.
                </p>
              </div>
              
              <div className="bg-neutral-light p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Do you offer international shipping?</h3>
                <p>
                  Yes, we ship to selected countries internationally. Shipping rates and delivery times vary by location.
                  Please check our shipping policy for more details.
                </p>
              </div>
              
              <div className="bg-neutral-light p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Are your parts covered by warranty?</h3>
                <p>
                  Most of our parts come with a manufacturer's warranty. The warranty period varies by product and brand.
                  Details can be found on individual product pages.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
