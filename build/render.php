<?php
/**
 * Render callback for the WooCommerce Product Calculator block
 *
 * @param array $attributes Block attributes
 * @return string Block HTML
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$calculator_title = isset( $attributes['calculatorTitle'] ) ? $attributes['calculatorTitle'] : __( 'Configure Your Product', 'woo-product-calculator' );
$steps = isset( $attributes['steps'] ) ? $attributes['steps'] : array();
$price_calculation = isset( $attributes['priceCalculation'] ) ? $attributes['priceCalculation'] : array( 'enabled' => false );
$button_text = isset( $attributes['buttonText'] ) ? $attributes['buttonText'] : __( 'Add to Cart', 'woo-product-calculator' );
$product_id = isset( $attributes['productId'] ) ? absint( $attributes['productId'] ) : 0;

// If no product selected, show error message
if ( ! $product_id ) {
	return '<div class="woo-calculator-error"><p>' . esc_html__( 'Please configure a product for this calculator in the block settings.', 'woo-product-calculator' ) . '</p></div>';
}

// Verify product exists
$product = wc_get_product( $product_id );
if ( ! $product ) {
	return '<div class="woo-calculator-error"><p>' . esc_html__( 'The selected product could not be found.', 'woo-product-calculator' ) . '</p></div>';
}

$wrapper_attributes = get_block_wrapper_attributes( array(
	'class' => 'wp-block-telex-woo-product-calculator',
	'data-steps' => esc_attr( wp_json_encode( $steps ) ),
	'data-price-calculation' => esc_attr( wp_json_encode( $price_calculation ) ),
	'data-product-id' => esc_attr( $product_id ),
	'data-button-text' => esc_attr( $button_text ),
) );

ob_start();
?>

<div <?php echo $wrapper_attributes; ?>>
	<div class="calculator-header">
		<h2><?php echo esc_html( $calculator_title ); ?></h2>
		<div class="product-reference">
			<p><?php echo esc_html__( 'Configuring:', 'woo-product-calculator' ); ?> <strong><?php echo esc_html( $product->get_name() ); ?></strong></p>
		</div>
	</div>

	<div class="calculator-progress">
		<div class="progress-line" style="width: 0%;"></div>
		<?php foreach ( $steps as $index => $step ) : ?>
			<div class="step-indicator" data-step="<?php echo esc_attr( $index ); ?>">
				<div class="step-circle"><?php echo esc_html( $index + 1 ); ?></div>
				<div class="step-title"><?php echo esc_html( $step['title'] ); ?></div>
			</div>
		<?php endforeach; ?>
	</div>

	<div class="calculator-content">
		<p><?php esc_html_e( 'Loading calculator...', 'woo-product-calculator' ); ?></p>
	</div>

	<?php if ( ! empty( $price_calculation['enabled'] ) ) : ?>
		<div class="calculator-price">
			<div class="price-label"><?php esc_html_e( 'Estimated Price:', 'woo-product-calculator' ); ?></div>
			<div class="price-amount">$0.00</div>
		</div>
	<?php endif; ?>

	<div class="calculator-navigation">
		<button type="button" class="btn-secondary btn-previous">
			<?php esc_html_e( 'Previous', 'woo-product-calculator' ); ?>
		</button>
		<button type="button" class="btn-primary btn-next">
			<?php esc_html_e( 'Next', 'woo-product-calculator' ); ?>
		</button>
	</div>
</div>

<?php
return ob_get_clean();