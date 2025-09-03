document.addEventListener('DOMContentLoaded', () => {
    console.log('signature.js: DOM loaded');
    
    const canvas = document.getElementById('signatureCanvas');
    if (!canvas) {
        console.error('signature.js: Canvas element not found');
        return;
    }
    
    const signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgba(0, 0, 0, 0)', // Set transparent background
        penColor: 'rgb(51, 51, 51)',
        minWidth: 2,
        maxWidth: 4
    });
    console.log('signature.js: SignaturePad initialized with transparent background');
    
    function resizeCanvas() {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext('2d').scale(ratio, ratio);
        signaturePad.clear();
        console.log('signature.js: Canvas resized:', canvas.width, canvas.height);
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    const nameSelect = document.getElementById('name');
    if (!nameSelect) {
        console.error('signature.js: Name select element not found');
        return;
    }
    
    // Load names from localStorage or use default
    let rowHeaderNames = JSON.parse(localStorage.getItem('attendanceNames')) || [
    ];
    
    function populateNameDropdown() {
        nameSelect.innerHTML = '<option value="" disabled selected>Select your name</option>';
        rowHeaderNames.slice(0, 18).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            nameSelect.appendChild(option);
        });
        console.log('signature.js: Name dropdown populated:', rowHeaderNames);
    }
    
    populateNameDropdown();
    
    const clearButton = document.getElementById('clearSignature');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            signaturePad.clear();
            console.log('signature.js: Signature cleared');
        });
    } else {
        console.error('signature.js: Clear signature button not found');
    }
    
    const form = document.getElementById('signatureForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = nameSelect.value.trim();
            if (!name) {
                alert('Please select your name.');
                console.warn('signature.js: Form submitted without a name');
                return;
            }
            if (signaturePad.isEmpty()) {
                alert('Please provide a signature.');
                console.warn('signature.js: Form submitted with empty signature');
                return;
            }
            const signatureData = signaturePad.toDataURL('image/png');
            console.log('signature.js: Signature captured for:', name, signatureData.substring(0, 50) + '...');
            let data = JSON.parse(localStorage.getItem('spreadsheetData')) || {};
            data[name] = { text: name, image: signatureData };
            localStorage.setItem('spreadsheetData', JSON.stringify(data));
            console.log('signature.js: Saved to localStorage:', data);
            window.dispatchEvent(new CustomEvent('storageUpdate'));
            nameSelect.value = '';
            signaturePad.clear();
            alert('Signature saved successfully! Please view the attendance report.');
            console.log('signature.js: Form cleared and storageUpdate dispatched');
        });
    } else {
        console.error('signature.js: Signature form not found');
    }
    
    // Update dropdown when names change
    window.addEventListener('namesUpdate', () => {
        console.log('signature.js: namesUpdate event triggered');
        const newNames = JSON.parse(localStorage.getItem('attendanceNames')) || rowHeaderNames;
        rowHeaderNames.length = 0;
        rowHeaderNames.push(...newNames.slice(0, 18));
        populateNameDropdown();
        console.log('signature.js: Name dropdown updated with:', rowHeaderNames);
    });
});
