export default function Footer() {
  return (
    <footer className="bg-brand text-white/75 pt-10 px-4 sm:px-6 lg:px-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-white/10">

        {/* Brand */}
        <div>
          <span className="font-display text-2xl font-bold text-white block mb-2">
            Lu<span className="text-accent2">x</span>e
          </span>
          <p className="text-sm text-white/55 leading-relaxed max-w-[200px]">
            Curated premium products delivered to your door. Quality you can trust.
          </p>
          <div className="flex gap-2 mt-3 flex-wrap">
            {['Visa', 'Mastercard', 'PayPal', 'Flutterwave'].map((b) => (
              <span key={b} className="px-2 py-0.5 border border-white/15 rounded text-[11px] text-white/50">{b}</span>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            {['IG', 'X', 'FB', 'TK'].map((s) => (
              <button key={s} className="w-8 h-8 rounded-full border border-white/20 text-white/70 text-xs hover:bg-accent hover:border-accent hover:text-white transition-all">
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4 className="text-xs font-medium text-white uppercase tracking-widest mb-3">Shop</h4>
          <ul className="space-y-2">
            {['New Arrivals', 'Tech', 'Fashion', 'Home & Living', 'Beauty', 'Sports', 'Sale'].map((l) => (
              <li key={l}><a className="text-sm text-white/55 hover:text-white cursor-pointer transition-colors">{l}</a></li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-xs font-medium text-white uppercase tracking-widest mb-3">Support</h4>
          <ul className="space-y-2">
            {['Track My Order', 'Returns & Refunds', 'Shipping Info', 'Size Guide', 'FAQs', 'Contact Us'].map((l) => (
              <li key={l}><a className="text-sm text-white/55 hover:text-white cursor-pointer transition-colors">{l}</a></li>
            ))}
          </ul>
        </div>

        {/* Newsletter + Company */}
        <div>
          <h4 className="text-xs font-medium text-white uppercase tracking-widest mb-3">Stay in the loop</h4>
          <p className="text-xs text-white/45 leading-relaxed mb-3">
            Get exclusive deals and new arrivals in your inbox.
          </p>
          <div className="flex">
            <input
              className="flex-1 px-3 py-2 text-xs bg-white/7 border border-white/20 rounded-l-lg text-white placeholder-white/35 outline-none border-r-0"
              placeholder="your@email.com"
            />
            <button className="px-3 py-2 bg-accent text-white text-xs rounded-r-lg whitespace-nowrap hover:opacity-85 transition-opacity">
              Subscribe
            </button>
          </div>
          <h4 className="text-xs font-medium text-white uppercase tracking-widest mt-5 mb-3">Company</h4>
          <ul className="space-y-2">
            {['About Us', 'Careers', 'Press'].map((l) => (
              <li key={l}><a className="text-sm text-white/55 hover:text-white cursor-pointer transition-colors">{l}</a></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 py-4 text-xs text-white/35">
        <span>© 2026 Luxe Store. All rights reserved.</span>
        <div className="flex flex-wrap justify-center gap-4">
          {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map((l) => (
            <a key={l} className="hover:text-white/70 cursor-pointer transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  )
}
