=== WooCommerce Product Calculator ===

Contributors:      WordPress Telex
Tags:              block, woocommerce, calculator, product, printing
Tested up to:      6.8
Stable tag:        0.1.0
License:           GPLv2 or later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

A dynamic product calculator for WooCommerce that enables custom field configuration for printing and manufacturing products.

== Description ==

WooCommerce Product Calculator is a powerful block that transforms product pages into interactive configuration tools. Perfect for printing services, custom manufacturing, or any business requiring detailed product specifications from customers.

**Seamless WooCommerce Integration:**

* Adds products with custom configurations directly to cart
* Displays all calculator inputs in cart, checkout, and order details
* Includes calculator data in order emails
* Prevents cart items with different configurations from merging
* Full compatibility with WooCommerce's standard checkout flow

**Key Features:**

* **Dynamic Field Configuration** - Create custom fields per product with support for text, number, dropdown, radio buttons, and file uploads
* **Multi-Step Form Navigation** - Break complex configurations into logical steps for better user experience
* **Complete Cart Integration** - Customer inputs automatically saved to cart items and order metadata
* **Conditional Logic** - Show/hide fields based on previous selections
* **Real-Time Price Calculation** - Calculate prices based on dimensions, quantity, and options
* **File Upload Support** - Accept artwork files with validation (PDF, PNG, JPG, AI, EPS)
* **Mobile Responsive** - Fully optimized for mobile devices
* **Admin-Friendly** - Intuitive interface for managing calculator fields
* **Email Integration** - Calculator data included in all WooCommerce order emails

**Perfect For:**

* Printing services (labels, stickers, business cards)
* Custom manufacturing
* Made-to-order products
* Products requiring detailed specifications
* Any business needing customer input before purchase

**How WooCommerce Integration Works:**

1. Customer fills out calculator fields
2. Clicks "Add to Cart" (AJAX submission)
3. Product added with all calculator data stored as cart item metadata
4. Data displays in cart with nice formatting
5. Data carries through to checkout
6. Saved to order items on order completion
7. Visible in admin order details
8. Included in customer and admin order emails

**Field Types Supported:**

* Text input
* Number input
* Dropdown select
* Radio buttons
* Checkbox groups
* File upload
* Textarea

**Built-In Templates:**

The block includes pre-configured templates for common use cases:
* Label/Sticker Printing
* Business Card Printing
* Banner Printing
* Custom Product Quote

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/woo-product-calculator` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Ensure WooCommerce is installed and activated
4. Add the "WooCommerce Product Calculator" block to any product page
5. Configure your calculator fields in the block settings
6. Test by adding a product to cart and checking that data appears correctly

== Frequently Asked Questions ==

= Does this work with any WooCommerce product type? =

Yes, the calculator works with simple products, variable products, and custom product types.

= Will calculator data show in my order emails? =

Yes! All calculator inputs are automatically included in WooCommerce order emails to both customers and admins.

= Can customers see their calculator inputs in the cart? =

Absolutely. All inputs display clearly in the cart, checkout, and order confirmation pages.

= Will items with different calculator data merge in the cart? =

No. The plugin prevents cart items with different calculator configurations from merging, keeping each unique configuration as a separate line item.

= Can I add custom price calculations? =

Yes, the block includes a price calculation system that you can configure based on field values.

= Is file upload secure? =

Yes, files are validated for type and size, uploaded to WordPress media library with proper permissions.

= How do I access calculator data in admin orders? =

Calculator data appears as order item metadata in the admin order details page, clearly labeled with each field name and value.

== Screenshots ==

1. Multi-step calculator interface on product page
2. Admin interface for configuring calculator fields
3. Calculator fields in the block editor
4. Customer inputs displayed in cart
5. Order details showing calculator data
6. Calculator data in order emails

== Changelog ==

= 0.1.0 =
* Initial release
* Multi-step form navigation
* Dynamic field types
* Full WooCommerce cart integration
* Order item metadata support
* Email integration
* File upload support
* Conditional logic
* Price calculation
* Mobile responsive design
* Prevents cart item merging for unique configurations

== Upgrade Notice ==

= 0.1.0 =
Initial release of WooCommerce Product Calculator with complete cart and order integration

== Additional Information ==

**Requirements:**
* WordPress 6.0 or higher
* WooCommerce 7.0 or higher
* PHP 7.4 or higher

**Browser Support:**
* Chrome (latest 2 versions)
* Firefox (latest 2 versions)
* Safari (latest 2 versions)
* Edge (latest 2 versions)

**Developer Features:**
* Extensive hook system for customization
* Filter support for field types
* Action hooks for calculation logic
* Clean, documented code
* Modular structure for easy extension
* WooCommerce standard hooks and filters