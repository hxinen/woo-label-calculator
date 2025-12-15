<?php
/**
 * Plugin Name:       WooCommerce Product Calculator
 * Plugin URI:        https://wordpress.org/plugins/woo-product-calculator
 * Description:       A dynamic product calculator for WooCommerce that enables custom field configuration for printing and manufacturing products.
 * Version:           0.1.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            WordPress Telex
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       woo-product-calculator
 * Domain Path:       /languages
 *
 * @package TelexWooProductCalculator
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Check if WooCommerce is active
 */
if ( ! function_exists( 'telex_woo_calculator_check_woocommerce' ) ) {
	function telex_woo_calculator_check_woocommerce() {
		if ( ! class_exists( 'WooCommerce' ) ) {
			add_action( 'admin_notices', 'telex_woo_calculator_woocommerce_notice' );
			return false;
		}
		return true;
	}
}

/**
 * Display admin notice if WooCommerce is not active
 */
if ( ! function_exists( 'telex_woo_calculator_woocommerce_notice' ) ) {
	function telex_woo_calculator_woocommerce_notice() {
		?>
		<div class="notice notice-error">
			<p><?php esc_html_e( 'WooCommerce Product Calculator requires WooCommerce to be installed and active.', 'woo-product-calculator' ); ?></p>
		</div>
		<?php
	}
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 */
if ( ! function_exists( 'telex_woo_calculator_block_init' ) ) {
	function telex_woo_calculator_block_init() {
		if ( ! telex_woo_calculator_check_woocommerce() ) {
			return;
		}
		
		register_block_type( 
			__DIR__ . '/build/',
			array(
				'render_callback' => 'telex_woo_calculator_render_callback',
			)
		);
	}
}
add_action( 'init', 'telex_woo_calculator_block_init' );

/**
 * Render callback function
 */
if ( ! function_exists( 'telex_woo_calculator_render_callback' ) ) {
	function telex_woo_calculator_render_callback( $attributes ) {
		// Enqueue the view script with inline data
		$asset_file = include( __DIR__ . '/build/view.asset.php' );
		
		wp_enqueue_script(
			'telex-woo-product-calculator-view',
			plugins_url( 'build/view.js', __FILE__ ),
			$asset_file['dependencies'],
			$asset_file['version'],
			true
		);
		
		wp_localize_script(
			'telex-woo-product-calculator-view',
			'wooCalculatorData',
			array(
				'ajaxUrl' => admin_url( 'admin-ajax.php' ),
				'nonce' => wp_create_nonce( 'woo-calculator-nonce' ),
			)
		);
		
		
		// Load the render template and return its output
		return require __DIR__ . '/build/render.php';
	}
}

/**
 * Handle AJAX request to add product to cart with calculator data
 */
if ( ! function_exists( 'telex_woo_calculator_add_to_cart' ) ) {
	function telex_woo_calculator_add_to_cart() {
		check_ajax_referer( 'woo-calculator-nonce', 'nonce' );
		
		$product_id = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
		$quantity = isset( $_POST['quantity'] ) ? absint( $_POST['quantity'] ) : 1;
		$calculator_data = isset( $_POST['calculator_data'] ) ? json_decode( stripslashes( $_POST['calculator_data'] ), true ) : array();
		
		if ( ! $product_id ) {
			wp_send_json_error( array( 'message' => __( 'Invalid product ID', 'woo-product-calculator' ) ) );
		}
		
		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			wp_send_json_error( array( 'message' => __( 'Product not found', 'woo-product-calculator' ) ) );
		}
		
		$cart_item_key = WC()->cart->add_to_cart( 
			$product_id, 
			$quantity, 
			0, 
			array(), 
			array( 'calculator_data' => $calculator_data )
		);
		
		if ( $cart_item_key ) {
			do_action( 'woocommerce_add_to_cart', $cart_item_key, $product_id, $quantity, 0, array(), array( 'calculator_data' => $calculator_data ) );
			
			wp_send_json_success( array(
				'message' => __( 'Product added to cart successfully!', 'woo-product-calculator' ),
				'cart_url' => wc_get_cart_url(),
				'cart_count' => WC()->cart->get_cart_contents_count(),
			) );
		} else {
			wp_send_json_error( array( 'message' => __( 'Failed to add product to cart', 'woo-product-calculator' ) ) );
		}
	}
}
add_action( 'wp_ajax_woo_calculator_add_to_cart', 'telex_woo_calculator_add_to_cart' );
add_action( 'wp_ajax_nopriv_woo_calculator_add_to_cart', 'telex_woo_calculator_add_to_cart' );

/**
 * Display calculator data in cart with better formatting
 */
if ( ! function_exists( 'telex_woo_calculator_cart_item_data' ) ) {
	function telex_woo_calculator_cart_item_data( $item_data, $cart_item ) {
		if ( isset( $cart_item['calculator_data'] ) && is_array( $cart_item['calculator_data'] ) ) {
			foreach ( $cart_item['calculator_data'] as $key => $value ) {
				if ( empty( $value ) ) {
					continue;
				}
				
				if ( is_array( $value ) ) {
					$value = implode( ', ', $value );
				}
				
				if ( filter_var( $value, FILTER_VALIDATE_URL ) ) {
					$filename = basename( $value );
					$value = '<a href="' . esc_url( $value ) . '" target="_blank">' . esc_html( $filename ) . '</a>';
				}
				
				$label = ucwords( str_replace( array( '_', '-' ), ' ', $key ) );
				
				$item_data[] = array(
					'key'     => $label,
					'value'   => $value,
					'display' => '',
				);
			}
		}
		
		return $item_data;
	}
}
add_filter( 'woocommerce_get_item_data', 'telex_woo_calculator_cart_item_data', 10, 2 );

/**
 * Add calculator data to order items
 */
if ( ! function_exists( 'telex_woo_calculator_add_order_item_meta' ) ) {
	function telex_woo_calculator_add_order_item_meta( $item, $cart_item_key, $values, $order ) {
		if ( isset( $values['calculator_data'] ) && is_array( $values['calculator_data'] ) ) {
			foreach ( $values['calculator_data'] as $key => $value ) {
				if ( empty( $value ) ) {
					continue;
				}
				
				if ( is_array( $value ) ) {
					$value = implode( ', ', $value );
				}
				
				$label = ucwords( str_replace( array( '_', '-' ), ' ', $key ) );
				
				$item->add_meta_data( $label, $value, true );
			}
		}
	}
}
add_action( 'woocommerce_checkout_create_order_line_item', 'telex_woo_calculator_add_order_item_meta', 10, 4 );

/**
 * Display calculator data in order emails
 */
if ( ! function_exists( 'telex_woo_calculator_order_item_meta' ) ) {
	function telex_woo_calculator_order_item_meta( $item_id, $item, $order, $plain_text ) {
		$metadata = $item->get_meta_data();
		
		if ( ! empty( $metadata ) ) {
			foreach ( $metadata as $meta ) {
				$data = $meta->get_data();
				if ( isset( $data['key'] ) && isset( $data['value'] ) ) {
					if ( ! str_starts_with( $data['key'], '_' ) ) {
						if ( $plain_text ) {
							echo "\n" . esc_html( $data['key'] ) . ': ' . esc_html( $data['value'] );
						} else {
							echo '<br><small>' . esc_html( $data['key'] ) . ': ' . wp_kses_post( $data['value'] ) . '</small>';
						}
					}
				}
			}
		}
	}
}
add_action( 'woocommerce_order_item_meta_end', 'telex_woo_calculator_order_item_meta', 10, 4 );

/**
 * Make cart item data unique to prevent merging
 */
if ( ! function_exists( 'telex_woo_calculator_cart_item_data_unique' ) ) {
	function telex_woo_calculator_cart_item_data_unique( $cart_item_data, $product_id ) {
		if ( isset( $cart_item_data['calculator_data'] ) ) {
			$cart_item_data['unique_key'] = md5( wp_json_encode( $cart_item_data['calculator_data'] ) );
		}
		return $cart_item_data;
	}
}
add_filter( 'woocommerce_add_cart_item_data', 'telex_woo_calculator_cart_item_data_unique', 10, 2 );

/**
 * Handle file upload via AJAX
 */
if ( ! function_exists( 'telex_woo_calculator_upload_file' ) ) {
	function telex_woo_calculator_upload_file() {
		check_ajax_referer( 'woo-calculator-nonce', 'nonce' );
		
		if ( ! function_exists( 'wp_handle_upload' ) ) {
			require_once( ABSPATH . 'wp-admin/includes/file.php' );
		}
		
		$allowed_types = array( 'pdf', 'png', 'jpg', 'jpeg', 'ai', 'eps' );
		$max_size = 10 * 1024 * 1024;
		
		if ( empty( $_FILES['file'] ) ) {
			wp_send_json_error( array( 'message' => __( 'No file uploaded', 'woo-product-calculator' ) ) );
		}
		
		$file = $_FILES['file'];
		$file_ext = strtolower( pathinfo( $file['name'], PATHINFO_EXTENSION ) );
		
		if ( ! in_array( $file_ext, $allowed_types ) ) {
			wp_send_json_error( array( 'message' => __( 'Invalid file type. Allowed: PDF, PNG, JPG, AI, EPS', 'woo-product-calculator' ) ) );
		}
		
		if ( $file['size'] > $max_size ) {
			wp_send_json_error( array( 'message' => __( 'File size exceeds 10MB limit', 'woo-product-calculator' ) ) );
		}
		
		$upload_overrides = array( 'test_form' => false );
		$uploaded_file = wp_handle_upload( $file, $upload_overrides );
		
		if ( isset( $uploaded_file['error'] ) ) {
			wp_send_json_error( array( 'message' => $uploaded_file['error'] ) );
		}
		
		wp_send_json_success( array(
			'url' => $uploaded_file['url'],
			'file' => $uploaded_file['file'],
			'name' => basename( $uploaded_file['file'] ),
		) );
	}
}
add_action( 'wp_ajax_woo_calculator_upload_file', 'telex_woo_calculator_upload_file' );
add_action( 'wp_ajax_nopriv_woo_calculator_upload_file', 'telex_woo_calculator_upload_file' );
