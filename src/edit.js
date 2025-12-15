
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { 
	PanelBody, 
	TextControl, 
	Button, 
	SelectControl,
	ToggleControl,
	__experimentalNumberControl as NumberControl,
	Notice
} from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { plus, trash } from '@wordpress/icons';
import './editor.scss';

export default function Edit( { attributes, setAttributes } ) {
	const { calculatorTitle, productId, steps, priceCalculation, buttonText } = attributes;
	const [ selectedStepIndex, setSelectedStepIndex ] = useState( 0 );
	const [ selectedFieldIndex, setSelectedFieldIndex ] = useState( null );

	// Fetch WooCommerce products
	const products = useSelect( ( select ) => {
		const { getEntityRecords } = select( 'core' );
		return getEntityRecords( 'postType', 'product', { per_page: -1 } ) || [];
	}, [] );

	const productOptions = [
		{ label: __( 'Select a product...', 'woo-product-calculator' ), value: 0 },
		...products.map( product => ( {
			label: product.title.rendered,
			value: product.id
		} ) )
	];

	const selectedProduct = products.find( p => p.id === productId );

	const blockProps = useBlockProps( {
		className: 'woo-calculator-editor',
	} );

	const fieldTypes = [
		{ label: __( 'Text', 'woo-product-calculator' ), value: 'text' },
		{ label: __( 'Number', 'woo-product-calculator' ), value: 'number' },
		{ label: __( 'Dropdown', 'woo-product-calculator' ), value: 'select' },
		{ label: __( 'Radio', 'woo-product-calculator' ), value: 'radio' },
		{ label: __( 'Checkbox', 'woo-product-calculator' ), value: 'checkbox' },
		{ label: __( 'Textarea', 'woo-product-calculator' ), value: 'textarea' },
		{ label: __( 'File Upload', 'woo-product-calculator' ), value: 'file' },
	];

	const addStep = () => {
		const newSteps = [ ...steps, { title: __( 'New Step', 'woo-product-calculator' ), fields: [] } ];
		setAttributes( { steps: newSteps } );
		setSelectedStepIndex( newSteps.length - 1 );
	};

	const updateStep = ( index, key, value ) => {
		const newSteps = [ ...steps ];
		newSteps[ index ][ key ] = value;
		setAttributes( { steps: newSteps } );
	};

	const removeStep = ( index ) => {
		const newSteps = steps.filter( ( _, i ) => i !== index );
		setAttributes( { steps: newSteps } );
		if ( selectedStepIndex >= newSteps.length ) {
			setSelectedStepIndex( Math.max( 0, newSteps.length - 1 ) );
		}
	};

	const addField = ( stepIndex ) => {
		const newSteps = [ ...steps ];
		if ( ! newSteps[ stepIndex ].fields ) {
			newSteps[ stepIndex ].fields = [];
		}
		newSteps[ stepIndex ].fields.push( {
			type: 'text',
			label: __( 'New Field', 'woo-product-calculator' ),
			name: 'field_' + Date.now(),
			required: false,
			options: [],
		} );
		setAttributes( { steps: newSteps } );
		setSelectedFieldIndex( newSteps[ stepIndex ].fields.length - 1 );
	};

	const updateField = ( stepIndex, fieldIndex, key, value ) => {
		const newSteps = [ ...steps ];
		newSteps[ stepIndex ].fields[ fieldIndex ][ key ] = value;
		setAttributes( { steps: newSteps } );
	};

	const removeField = ( stepIndex, fieldIndex ) => {
		const newSteps = [ ...steps ];
		newSteps[ stepIndex ].fields = newSteps[ stepIndex ].fields.filter( ( _, i ) => i !== fieldIndex );
		setAttributes( { steps: newSteps } );
		setSelectedFieldIndex( null );
	};

	const addFieldOption = ( stepIndex, fieldIndex ) => {
		const newSteps = [ ...steps ];
		if ( ! newSteps[ stepIndex ].fields[ fieldIndex ].options ) {
			newSteps[ stepIndex ].fields[ fieldIndex ].options = [];
		}
		newSteps[ stepIndex ].fields[ fieldIndex ].options.push( {
			label: __( 'Option', 'woo-product-calculator' ),
			value: 'option_' + Date.now(),
		} );
		setAttributes( { steps: newSteps } );
	};

	const updateFieldOption = ( stepIndex, fieldIndex, optionIndex, key, value ) => {
		const newSteps = [ ...steps ];
		newSteps[ stepIndex ].fields[ fieldIndex ].options[ optionIndex ][ key ] = value;
		setAttributes( { steps: newSteps } );
	};

	const removeFieldOption = ( stepIndex, fieldIndex, optionIndex ) => {
		const newSteps = [ ...steps ];
		newSteps[ stepIndex ].fields[ fieldIndex ].options = 
			newSteps[ stepIndex ].fields[ fieldIndex ].options.filter( ( _, i ) => i !== optionIndex );
		setAttributes( { steps: newSteps } );
	};

	const currentStep = steps[ selectedStepIndex ];
	const currentField = selectedFieldIndex !== null && currentStep?.fields?.[ selectedFieldIndex ];

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Product Selection', 'woo-product-calculator' ) } initialOpen={ true }>
					<SelectControl
						label={ __( 'Linked Product', 'woo-product-calculator' ) }
						value={ productId }
						options={ productOptions }
						onChange={ ( value ) => setAttributes( { productId: parseInt( value ) } ) }
						help={ __( 'Select the WooCommerce product this calculator will add to cart', 'woo-product-calculator' ) }
					/>
					{ ! productId && (
						<Notice status="warning" isDismissible={ false }>
							{ __( 'Please select a product for this calculator to work properly.', 'woo-product-calculator' ) }
						</Notice>
					) }
					{ selectedProduct && (
						<div className="product-info">
							<p><strong>{ __( 'Selected:', 'woo-product-calculator' ) }</strong> { selectedProduct.title.rendered }</p>
						</div>
					) }
				</PanelBody>

				<PanelBody title={ __( 'Calculator Settings', 'woo-product-calculator' ) }>
					<TextControl
						label={ __( 'Calculator Title', 'woo-product-calculator' ) }
						value={ calculatorTitle }
						onChange={ ( value ) => setAttributes( { calculatorTitle: value } ) }
					/>
					<TextControl
						label={ __( 'Button Text', 'woo-product-calculator' ) }
						value={ buttonText }
						onChange={ ( value ) => setAttributes( { buttonText: value } ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Price Calculation', 'woo-product-calculator' ) } initialOpen={ false }>
					<ToggleControl
						label={ __( 'Enable Price Calculation', 'woo-product-calculator' ) }
						checked={ priceCalculation.enabled }
						onChange={ ( value ) => setAttributes( { 
							priceCalculation: { ...priceCalculation, enabled: value } 
						} ) }
					/>
					{ priceCalculation.enabled && (
						<>
							<Notice status="info" isDismissible={ false }>
								{ __( 'Use field names in your formula. Example: width * height * quantity * 0.01', 'woo-product-calculator' ) }
							</Notice>
							<TextControl
								label={ __( 'Formula', 'woo-product-calculator' ) }
								value={ priceCalculation.formula }
								onChange={ ( value ) => setAttributes( { 
									priceCalculation: { ...priceCalculation, formula: value } 
								} ) }
								help={ __( 'Mathematical formula using field names', 'woo-product-calculator' ) }
							/>
						</>
					) }
				</PanelBody>

				<PanelBody title={ __( 'Steps', 'woo-product-calculator' ) } initialOpen={ true }>
					<div className="calculator-steps-list">
						{ steps.map( ( step, index ) => (
							<div 
								key={ index } 
								className={ `calculator-step-item ${ index === selectedStepIndex ? 'active' : '' }` }
								onClick={ () => setSelectedStepIndex( index ) }
							>
								<span>{ step.title }</span>
								<Button
									icon={ trash }
									isDestructive
									isSmall
									onClick={ ( e ) => {
										e.stopPropagation();
										removeStep( index );
									} }
								/>
							</div>
						) ) }
					</div>
					<Button
						icon={ plus }
						variant="secondary"
						onClick={ addStep }
						className="calculator-add-step"
					>
						{ __( 'Add Step', 'woo-product-calculator' ) }
					</Button>
				</PanelBody>

				{ currentStep && (
					<PanelBody title={ __( 'Step Settings', 'woo-product-calculator' ) } initialOpen={ true }>
						<TextControl
							label={ __( 'Step Title', 'woo-product-calculator' ) }
							value={ currentStep.title }
							onChange={ ( value ) => updateStep( selectedStepIndex, 'title', value ) }
						/>
						
						<div className="calculator-fields-list">
							<h4>{ __( 'Fields', 'woo-product-calculator' ) }</h4>
							{ currentStep.fields?.map( ( field, fieldIndex ) => (
								<div 
									key={ fieldIndex }
									className={ `calculator-field-item ${ fieldIndex === selectedFieldIndex ? 'active' : '' }` }
									onClick={ () => setSelectedFieldIndex( fieldIndex ) }
								>
									<span>{ field.label } ({ field.type })</span>
									<Button
										icon={ trash }
										isDestructive
										isSmall
										onClick={ ( e ) => {
											e.stopPropagation();
											removeField( selectedStepIndex, fieldIndex );
										} }
									/>
								</div>
							) ) }
						</div>
						
						<Button
							icon={ plus }
							variant="secondary"
							onClick={ () => addField( selectedStepIndex ) }
							className="calculator-add-field"
						>
							{ __( 'Add Field', 'woo-product-calculator' ) }
						</Button>
					</PanelBody>
				) }

				{ currentField && (
					<PanelBody title={ __( 'Field Settings', 'woo-product-calculator' ) } initialOpen={ true }>
						<SelectControl
							label={ __( 'Field Type', 'woo-product-calculator' ) }
							value={ currentField.type }
							options={ fieldTypes }
							onChange={ ( value ) => updateField( selectedStepIndex, selectedFieldIndex, 'type', value ) }
						/>
						<TextControl
							label={ __( 'Label', 'woo-product-calculator' ) }
							value={ currentField.label }
							onChange={ ( value ) => updateField( selectedStepIndex, selectedFieldIndex, 'label', value ) }
						/>
						<TextControl
							label={ __( 'Field Name', 'woo-product-calculator' ) }
							value={ currentField.name }
							onChange={ ( value ) => updateField( selectedStepIndex, selectedFieldIndex, 'name', value ) }
							help={ __( 'Used in formulas and cart data', 'woo-product-calculator' ) }
						/>
						<ToggleControl
							label={ __( 'Required', 'woo-product-calculator' ) }
							checked={ currentField.required }
							onChange={ ( value ) => updateField( selectedStepIndex, selectedFieldIndex, 'required', value ) }
						/>

						{ [ 'select', 'radio', 'checkbox' ].includes( currentField.type ) && (
							<>
								<h4>{ __( 'Options', 'woo-product-calculator' ) }</h4>
								{ currentField.options?.map( ( option, optionIndex ) => (
									<div key={ optionIndex } className="calculator-option-item">
										<TextControl
											label={ __( 'Label', 'woo-product-calculator' ) }
											value={ option.label }
											onChange={ ( value ) => updateFieldOption( selectedStepIndex, selectedFieldIndex, optionIndex, 'label', value ) }
										/>
										<TextControl
											label={ __( 'Value', 'woo-product-calculator' ) }
											value={ option.value }
											onChange={ ( value ) => updateFieldOption( selectedStepIndex, selectedFieldIndex, optionIndex, 'value', value ) }
										/>
										<Button
											icon={ trash }
											isDestructive
											isSmall
											onClick={ () => removeFieldOption( selectedStepIndex, selectedFieldIndex, optionIndex ) }
										>
											{ __( 'Remove', 'woo-product-calculator' ) }
										</Button>
									</div>
								) ) }
								<Button
									icon={ plus }
									variant="secondary"
									onClick={ () => addFieldOption( selectedStepIndex, selectedFieldIndex ) }
								>
									{ __( 'Add Option', 'woo-product-calculator' ) }
								</Button>
							</>
						) }

						{ currentField.type === 'number' && (
							<>
								<NumberControl
									label={ __( 'Min Value', 'woo-product-calculator' ) }
									value={ currentField.min }
									onChange={ ( value ) => updateField( selectedStepIndex, selectedFieldIndex, 'min', value ) }
								/>
								<NumberControl
									label={ __( 'Max Value', 'woo-product-calculator' ) }
									value={ currentField.max }
									onChange={ ( value ) => updateField( selectedStepIndex, selectedFieldIndex, 'max', value ) }
								/>
								<NumberControl
									label={ __( 'Step', 'woo-product-calculator' ) }
									value={ currentField.step }
									onChange={ ( value ) => updateField( selectedStepIndex, selectedFieldIndex, 'step', value ) }
								/>
							</>
						) }
					</PanelBody>
				) }
			</InspectorControls>

			<div { ...blockProps }>
				<div className="calculator-preview">
					<h3>{ calculatorTitle }</h3>
					{ ! productId && (
						<Notice status="warning" isDismissible={ false }>
							{ __( 'Please select a product in the block settings.', 'woo-product-calculator' ) }
						</Notice>
					) }
					{ selectedProduct && (
						<div className="selected-product-info">
							<p>{ __( 'Adding to cart:', 'woo-product-calculator' ) } <strong>{ selectedProduct.title.rendered }</strong></p>
						</div>
					) }
					<div className="calculator-steps-preview">
						{ steps.map( ( step, index ) => (
							<div 
								key={ index }
								className={ `step-indicator ${ index === selectedStepIndex ? 'active' : '' }` }
							>
								<span className="step-number">{ index + 1 }</span>
								<span className="step-title">{ step.title }</span>
							</div>
						) ) }
					</div>
					
					{ currentStep && (
						<div className="calculator-step-content">
							<h4>{ currentStep.title }</h4>
							{ currentStep.fields?.length > 0 ? (
								<div className="calculator-fields">
									{ currentStep.fields.map( ( field, index ) => (
										<div key={ index } className="calculator-field">
											<label>
												{ field.label }
												{ field.required && <span className="required">*</span> }
											</label>
											<div className="field-type-indicator">
												{ field.type }
											</div>
										</div>
									) ) }
								</div>
							) : (
								<p className="no-fields">
									{ __( 'No fields added yet. Add fields in the sidebar.', 'woo-product-calculator' ) }
								</p>
							) }
						</div>
					) }

					<div className="calculator-navigation">
						<Button variant="secondary" disabled={ selectedStepIndex === 0 }>
							{ __( 'Previous', 'woo-product-calculator' ) }
						</Button>
						<Button variant="primary">
							{ selectedStepIndex === steps.length - 1 ? buttonText : __( 'Next', 'woo-product-calculator' ) }
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}
