import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaXTwitter,
} from "react-icons/fa6";

const footerNavItems = [
  { label: "Home", href: "/" },
  { label: "Our Journey", href: "/our-journey" },
  { label: "Royal Products", href: "/royal-products" },
  { label: "Castle Locator", href: "/castle-locator" },
  { label: "Franchises", href: "/franchise" },
  { label: "Royal Events", href: "/royal-events" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Achievements", href: "/achievements" },
];

const popularSearches = [
  { label: "Waffle Shop India", href: "/castle-locator" },
  { label: "Waffle Cafe Near Me", href: "/castle-locator" },
  { label: "Best Waffle Shop", href: "/royal-products" },
  { label: "Best Waffle Cafe in India", href: "/castle-locator" },
  { label: "Waffle Dessert Shop", href: "/royal-products" },
  { label: "Freshly Made Waffles", href: "/royal-products" },
  { label: "Crispy Waffles", href: "/royal-products" },
  { label: "Soft Waffles", href: "/royal-products" },
  { label: "Loaded Chocolate Waffles", href: "/royal-products" },
  { label: "Nutella Waffles", href: "/royal-products" },
  { label: "Oreo Waffles", href: "/royal-products" },
  { label: "KitKat Waffles", href: "/royal-products" },
  { label: "Brownie Waffles", href: "/royal-products" },
  { label: "Belgian Chocolate Waffles", href: "/royal-products" },
  { label: "Classic Waffles", href: "/royal-products" },
  { label: "Fruit Waffles", href: "/royal-products" },
  { label: "Strawberry Waffles", href: "/royal-products" },
  { label: "Blueberry Waffles", href: "/royal-products" },
  { label: "White Chocolate Waffles", href: "/royal-products" },
  { label: "Dark Chocolate Waffles", href: "/royal-products" },
  { label: "Waffles with Ice Cream", href: "/royal-products" },
  { label: "Chocolate Overload Waffles", href: "/royal-products" },
  { label: "Signature Waffles", href: "/royal-products" },
  { label: "Gourmet Waffles", href: "/royal-products" },
  { label: "Premium Dessert Waffles", href: "/royal-products" },
  { label: "Waffle Combos", href: "/royal-products" },
  { label: "Waffle Box", href: "/royal-products" },
  { label: "Waffle Bites", href: "/royal-products" },
  { label: "Waffle Fingers", href: "/royal-products" },
  { label: "Waffle Sticks Near Me", href: "/castle-locator" },
  { label: "Chocolate Waffle Sticks", href: "/royal-products" },
  { label: "Mini Pancake Shop", href: "/royal-products" },
  { label: "Mini Pancakes Near Me", href: "/castle-locator" },
  { label: "Pancakes with Chocolate", href: "/royal-products" },
  { label: "Pancake Desserts", href: "/royal-products" },
  { label: "Chocolate Pancake Bites", href: "/royal-products" },
  { label: "Mini Pancake Combos", href: "/royal-products" },
  { label: "Pancakes and Waffles", href: "/royal-products" },
  { label: "Chocolate Desserts Near Me", href: "/castle-locator" },
  { label: "Dessert Shop Near Me", href: "/castle-locator" },
  { label: "Sweet Shop Near Me", href: "/castle-locator" },
  { label: "Dessert Cafe Near Me", href: "/castle-locator" },
  { label: "Late Night Dessert Shop", href: "/castle-locator" },
  { label: "Dessert Takeaway", href: "/castle-locator" },
  { label: "Quick Dessert Delivery", href: "/castle-locator" },
  { label: "Waffles for Takeaway", href: "/castle-locator" },
  { label: "Waffles for Dessert Lovers", href: "/royal-products" },
  { label: "Chocolate Treats", href: "/royal-products" },
  { label: "Sweet Treats Near Me", href: "/castle-locator" },
  { label: "Chocolate Lovers Desserts", href: "/royal-products" },
  { label: "Milkshake Shop Near Me", href: "/castle-locator" },
  { label: "Thick Shakes", href: "/royal-products" },
  { label: "Chocolate Milkshake", href: "/royal-products" },
  { label: "Oreo Milkshake", href: "/royal-products" },
  { label: "Brownie Shake", href: "/royal-products" },
  { label: "Strawberry Milkshake", href: "/royal-products" },
  { label: "Cold Coffee Near Me", href: "/castle-locator" },
  { label: "Iced Coffee", href: "/royal-products" },
  { label: "Refreshing Beverages", href: "/royal-products" },
  { label: "Waffle and Shake Combos", href: "/royal-products" },
  { label: "Waffle Delivery", href: "/castle-locator" },
  { label: "Order Waffles Online", href: "/castle-locator" },
  { label: "Waffles for Parties", href: "/royal-events" },
  { label: "Desserts for Celebrations", href: "/royal-events" },
  { label: "Birthday Desserts", href: "/royal-events" },
  { label: "Group Dessert Orders", href: "/royal-events" },
  { label: "Waffle Castle Menu", href: "/royal-products" },
  { label: "Waffle Castle Outlets", href: "/castle-locator" },
  { label: "Waffle Castle Locations", href: "/castle-locator" },
  { label: "Waffle Castle Near Me", href: "/castle-locator" },
  { label: "Waffle Castle Desserts", href: "/royal-products" },
  { label: "Waffle Castle Franchise", href: "/franchise" },
  { label: "Waffle Franchise in India", href: "/franchise" },
  { label: "Waffle Franchise Investment", href: "/franchise" },
  { label: "Waffle Franchise Cost in India", href: "/franchise" },
  { label: "Start a Waffle Business", href: "/franchise" },
  { label: "Open a Waffle Cafe", href: "/franchise" },
  { label: "Dessert Franchise Opportunities", href: "/franchise" },
  { label: "Cafe Franchise in India", href: "/franchise" },
  { label: "Food Business Franchise", href: "/franchise" },
  { label: "Quick Service Restaurant Franchise", href: "/franchise" },
  { label: "QSR Franchise in India", href: "/franchise" },
  { label: "Dessert Business Opportunities", href: "/franchise" },
  { label: "Waffle Shop Business", href: "/franchise" },
  { label: "Waffle Cafe Business Model", href: "/franchise" },
  { label: "Waffle Franchise Enquiry", href: "/franchise" },
];

export default function Footer() {
  return (
    <footer className="footer-unique">
      {/* Melted Chocolate / Waffle Wave Top Divider */}


      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand-section">
            <Link href="/" className="footer-logo-link">
              <img src="/images/logo.png" alt="Waffle Castle Logo" className="footer-logo-large" />
            </Link>
            <p className="brand-pitch">
              Crafting royal moments through the art of perfectly crispy waffles.
              Join our kingdom of sweetness and experience luxury in every bite.
            </p>
            <div className="footer-social-unique">
              <a href="https://www.facebook.com/wafflecastleofficial" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
              <a href="https://www.instagram.com/waffle_castle_official/" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
              <a href="https://www.linkedin.com/company/waffle-castle-official/" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
              <a href="https://www.youtube.com/@WaffleCastle" target="_blank" rel="noopener noreferrer"><FaYoutube /></a>
              <a href="https://x.com/Waffle_castle" target="_blank" rel="noopener noreferrer"><FaXTwitter /></a>
            </div>
          </div>

          <div className="footer-nav-section">
            <div className="nav-col">
              <h4>Explore</h4>
              <ul className="footer-nav-list">
                {footerNavItems.slice(0, 5).map((item) => (
                  <li key={item.label}><Link href={item.href}>{item.label}</Link></li>
                ))}
              </ul>
            </div>
            <div className="nav-col">
              <h4>Company</h4>
              <ul className="footer-nav-list">
                {footerNavItems.slice(5).map((item) => (
                  <li key={item.label}><Link href={item.href}>{item.label}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="footer-cta-section">
            <div className="cta-box">
              <h3>Join the Kingdom</h3>
              <p>Subscribe for royal offers and new menu launches.</p>
              <form className="footer-subscribe">
                <input type="email" placeholder="Your email" />
                <button type="submit">Join</button>
              </form>
            </div>
            <div className="footer-contact-info">
              <p>Email: <a href="mailto:info@wafflecastle.in">info@wafflecastle.in</a></p>
              <p>Phone: <a href="tel:+919537788817">+91 95377 88817</a></p>
            </div>
          </div>
        </div>

        {/* SEO Popular Searches Section */}
        <div className="footer-seo-section">
          <h4 className="footer-seo-title">Popular Searches</h4>
          <div className="footer-seo-tags">
            {popularSearches.map((item, index) => (
              <span key={item.label} className="footer-seo-item">
                <Link href={item.href} className="footer-seo-link">
                  {item.label}
                </Link>
                {index < popularSearches.length - 1 && (
                  <span className="footer-seo-sep" aria-hidden="true"> · </span>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="footer-legal">
          <p>© 2026 WAFFLE CASTLE. Designed for Royalty.</p>
        </div>
      </div>
    </footer>
  );
}