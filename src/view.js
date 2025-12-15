document.addEventListener('DOMContentLoaded', function() {
	if (typeof wooCalculatorData === 'undefined') {
		console.error('WooCommerce Calculator: Configuration data not loaded');
		return;
	}
	
	const calculators = document.querySelectorAll('.wp-block-telex-woo-product-calculator');
	
	calculators.forEach(function(calculator) {
		initCalculator(calculator);
	});
});

function initCalculator(calculator) {
	const stepsData = JSON.parse(calculator.dataset.steps || '[]');
	const priceCalculation = JSON.parse(calculator.dataset.priceCalculation || '{"enabled":false}');
	const productId = calculator.dataset.productId || 0;
	
	let currentStep = 0;
	let formData = {};
	let uploadedFiles = {};
	
	const contentArea = calculator.querySelector('.calculator-content');
	const prevButton = calculator.querySelector('.btn-previous');
	const nextButton = calculator.querySelector('.btn-next');
	const priceDisplay = calculator.querySelector('.calculator-price');
	
	function renderStep(stepIndex) {
		const step = stepsData[stepIndex];
		if (!step) return;
		
		currentStep = stepIndex;
		
		// Update progress indicators
		const indicators = calculator.querySelectorAll('.step-indicator');
		indicators.forEach(function(indicator, index) {
			indicator.classList.remove('active', 'completed');
			if (index === stepIndex) {
				indicator.classList.add('active');
			} else if (index < stepIndex) {
				indicator.classList.add('completed');
			}
		});
		
		// Update progress line
		const progressLine = calculator.querySelector('.progress-line');
		if (progressLine) {
			const progress = (stepIndex / (stepsData.length - 1)) * 100;
			progressLine.style.width = progress + '%';
		}
		
		// Render fields
		let html = '<h3 class="step-title">' + escapeHtml(step.title) + '</h3>';
		html += '<div class="calculator-fields">';
		
		step.fields.forEach(function(field) {
			html += renderField(field);
		});
		
		html += '</div>';
		contentArea.innerHTML = html;
		
		// Attach event listeners
		attachFieldListeners(step.fields);
		
		// Update navigation buttons
		updateNavigation();
		
		// Update price if enabled
		if (priceCalculation.enabled) {
			updatePrice();
		}
	}
	
	function renderField(field) {
		const value = formData[field.name] || '';
		const required = field.required ? '<span class="required">*</span>' : '';
		
		let html = '<div class="field-group" data-field-name="' + field.name + '">';
		html += '<label>' + escapeHtml(field.label) + required + '</label>';
		
		switch(field.type) {
			case 'text':
			case 'number':
				const inputType = field.type;
				const min = field.min ? ' min="' + field.min + '"' : '';
				const max = field.max ? ' max="' + field.max + '"' : '';
				const step = field.step ? ' step="' + field.step + '"' : '';
				html += '<input type="' + inputType + '" name="' + field.name + '" value="' + escapeHtml(value) + '"' + min + max + step + ' />';
				break;
				
			case 'textarea':
				html += '<textarea name="' + field.name + '">' + escapeHtml(value) + '</textarea>';
				break;
				
			case 'select':
				html += '<select name="' + field.name + '">';
				html += '<option value="">Select an option</option>';
				(field.options || []).forEach(function(option) {
					const selected = value === option.value ? ' selected' : '';
					html += '<option value="' + escapeHtml(option.value) + '"' + selected + '>' + escapeHtml(option.label) + '</option>';
				});
				html += '</select>';
				break;
				
			case 'radio':
				html += '<div class="radio-group">';
				(field.options || []).forEach(function(option) {
					const checked = value === option.value ? ' checked' : '';
					html += '<label><input type="radio" name="' + field.name + '" value="' + escapeHtml(option.value) + '"' + checked + ' /> ' + escapeHtml(option.label) + '</label>';
				});
				html += '</div>';
				break;
				
			case 'checkbox':
				html += '<div class="checkbox-group">';
				(field.options || []).forEach(function(option) {
					const checked = Array.isArray(value) && value.includes(option.value) ? ' checked' : '';
					html += '<label><input type="checkbox" name="' + field.name + '[]" value="' + escapeHtml(option.value) + '"' + checked + ' /> ' + escapeHtml(option.label) + '</label>';
				});
				html += '</div>';
				break;
				
			case 'file':
				const fileName = uploadedFiles[field.name] ? uploadedFiles[field.name].name : 'No file chosen';
				const hasFile = uploadedFiles[field.name] ? ' has-file' : '';
				html += '<div class="file-upload' + hasFile + '" data-field="' + field.name + '">';
				html += '<div class="upload-icon">📁</div>';
				html += '<div class="upload-text">Click to upload or drag and drop</div>';
				html += '<div class="file-info">Accepted: PDF, PNG, JPG, AI, EPS (Max 10MB)</div>';
				html += '<div class="file-name">' + fileName + '</div>';
				html += '<input type="file" name="' + field.name + '" accept=".pdf,.png,.jpg,.jpeg,.ai,.eps" />';
				html += '</div>';
				break;
		}
		
		html += '<div class="error-message"></div>';
		html += '</div>';
		
		return html;
	}
	
	function attachFieldListeners(fields) {
		fields.forEach(function(field) {
			const fieldElement = contentArea.querySelector('[data-field-name="' + field.name + '"]');
			if (!fieldElement) return;
			
			if (field.type === 'file') {
				const fileUpload = fieldElement.querySelector('.file-upload');
				const fileInput = fieldElement.querySelector('input[type="file"]');
				
				fileUpload.addEventListener('click', function() {
					fileInput.click();
				});
				
				fileInput.addEventListener('change', function(e) {
					handleFileUpload(e.target, field.name);
				});
				
				// Drag and drop
				fileUpload.addEventListener('dragover', function(e) {
					e.preventDefault();
					fileUpload.classList.add('dragover');
				});
				
				fileUpload.addEventListener('dragleave', function() {
					fileUpload.classList.remove('dragover');
				});
				
				fileUpload.addEventListener('drop', function(e) {
					e.preventDefault();
					fileUpload.classList.remove('dragover');
					fileInput.files = e.dataTransfer.files;
					handleFileUpload(fileInput, field.name);
				});
			} else if (field.type === 'checkbox') {
				const checkboxes = fieldElement.querySelectorAll('input[type="checkbox"]');
				checkboxes.forEach(function(checkbox) {
					checkbox.addEventListener('change', function() {
						const values = Array.from(checkboxes)
							.filter(cb => cb.checked)
							.map(cb => cb.value);
						formData[field.name] = values;
						if (priceCalculation.enabled) {
							updatePrice();
						}
					});
				});
			} else {
				const input = fieldElement.querySelector('input, select, textarea');
				if (input) {
					input.addEventListener('change', function() {
						formData[field.name] = this.value;
						clearError(field.name);
						if (priceCalculation.enabled) {
							updatePrice();
						}
					});
				}
			}
		});
	}
	
	function handleFileUpload(input, fieldName) {
		const file = input.files[0];
		if (!file) return;
		
		// Validate file
		const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
		const maxSize = 10 * 1024 * 1024; // 10MB
		
		if (!allowedTypes.includes(file.type) && !file.name.match(/\.(ai|eps)$/i)) {
			showError(fieldName, 'Invalid file type. Please upload PDF, PNG, JPG, AI, or EPS.');
			return;
		}
		
		if (file.size > maxSize) {
			showError(fieldName, 'File size exceeds 10MB limit.');
			return;
		}
		
		// Show loading
		const fileUpload = input.closest('.file-upload');
		fileUpload.classList.add('uploading');
		
		// Upload file via AJAX
		const uploadData = new FormData();
		uploadData.append('file', file);
		uploadData.append('action', 'woo_calculator_upload_file');
		uploadData.append('nonce', wooCalculatorData.nonce);
		
		fetch(wooCalculatorData.ajaxUrl, {
			method: 'POST',
			body: uploadData
		})
		.then(response => response.json())
		.then(data => {
			fileUpload.classList.remove('uploading');
			if (data.success) {
				uploadedFiles[fieldName] = {
					name: file.name,
					url: data.data.url
				};
				fileUpload.classList.add('has-file');
				fileUpload.querySelector('.file-name').textContent = file.name;
				formData[fieldName] = data.data.url;
				clearError(fieldName);
			} else {
				showError(fieldName, data.data.message || 'Upload failed');
			}
		})
		.catch(error => {
			fileUpload.classList.remove('uploading');
			showError(fieldName, 'Upload failed. Please try again.');
		});
	}
	
	function validateStep(stepIndex) {
		const step = stepsData[stepIndex];
		let isValid = true;
		
		step.fields.forEach(function(field) {
			if (field.required) {
				const value = formData[field.name];
				if (!value || (Array.isArray(value) && value.length === 0)) {
					showError(field.name, 'This field is required');
					isValid = false;
				}
			}
		});
		
		return isValid;
	}
	
	function showError(fieldName, message) {
		const fieldElement = contentArea.querySelector('[data-field-name="' + fieldName + '"]');
		if (fieldElement) {
			const input = fieldElement.querySelector('input, select, textarea');
			if (input) {
				input.classList.add('error');
			}
			const errorElement = fieldElement.querySelector('.error-message');
			if (errorElement) {
				errorElement.textContent = message;
			}
		}
	}
	
	function clearError(fieldName) {
		const fieldElement = contentArea.querySelector('[data-field-name="' + fieldName + '"]');
		if (fieldElement) {
			const input = fieldElement.querySelector('input, select, textarea');
			if (input) {
				input.classList.remove('error');
			}
			const errorElement = fieldElement.querySelector('.error-message');
			if (errorElement) {
				errorElement.textContent = '';
			}
		}
	}
	
	function updateNavigation() {
		prevButton.disabled = currentStep === 0;
		
		if (currentStep === stepsData.length - 1) {
			nextButton.textContent = calculator.dataset.buttonText || 'Add to Cart';
		} else {
			nextButton.textContent = 'Next';
		}
	}
	
	function updatePrice() {
		if (!priceCalculation.enabled || !priceCalculation.formula) return;
		
		try {
			// Replace field names with values in formula
			let formula = priceCalculation.formula;
			Object.keys(formData).forEach(function(key) {
				const value = parseFloat(formData[key]) || 0;
				formula = formula.replace(new RegExp(key, 'g'), value);
			});
			
			// Evaluate formula (simple math only)
			const price = eval(formula);
			
			if (priceDisplay && !isNaN(price)) {
				priceDisplay.querySelector('.price-amount').textContent = '$' + price.toFixed(2);
			}
		} catch (error) {
			console.error('Price calculation error:', error);
		}
	}
	
	function submitCalculator() {
		// Show loading
		contentArea.innerHTML = '<div class="calculator-loading"><div class="spinner"></div><p>Adding to cart...</p></div>';
		
		// Submit to cart via AJAX
		const data = new FormData();
		data.append('action', 'woo_calculator_add_to_cart');
		data.append('nonce', wooCalculatorData.nonce);
		data.append('product_id', productId);
		data.append('quantity', formData.quantity || 1);
		data.append('calculator_data', JSON.stringify(formData));
		
		fetch(wooCalculatorData.ajaxUrl, {
			method: 'POST',
			body: data
		})
		.then(response => response.json())
		.then(result => {
			if (result.success) {
				contentArea.innerHTML = '<div class="calculator-success"><div class="success-icon">✓</div><h3>Added to Cart!</h3><p>' + result.data.message + '</p><a href="' + result.data.cart_url + '" class="view-cart-btn">View Cart</a></div>';
				// Update cart count if mini cart exists
				if (result.data.cart_count) {
					const cartCounts = document.querySelectorAll('.cart-contents-count');
					cartCounts.forEach(el => el.textContent = result.data.cart_count);
				}
			} else {
				contentArea.innerHTML = '<div class="calculator-error"><p>Error: ' + result.data.message + '</p><button class="btn-primary btn-retry">Try Again</button></div>';
				const retryButton = contentArea.querySelector('.btn-retry');
				retryButton.addEventListener('click', function() {
					renderStep(currentStep);
				});
			}
		})
		.catch(error => {
			contentArea.innerHTML = '<div class="calculator-error"><p>An error occurred. Please try again.</p><button class="btn-primary btn-retry">Try Again</button></div>';
			const retryButton = contentArea.querySelector('.btn-retry');
			retryButton.addEventListener('click', function() {
				renderStep(currentStep);
			});
		});
	}
	
	// Navigation event listeners
	prevButton.addEventListener('click', function() {
		if (currentStep > 0) {
			renderStep(currentStep - 1);
		}
	});
	
	nextButton.addEventListener('click', function() {
		if (!validateStep(currentStep)) {
			return;
		}
		
		if (currentStep < stepsData.length - 1) {
			renderStep(currentStep + 1);
		} else {
			submitCalculator();
		}
	});
	
	// Initialize first step
	renderStep(0);
}

function escapeHtml(text) {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}