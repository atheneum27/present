document.addEventListener('DOMContentLoaded', () => {
    console.log('report.js: DOM loaded');

    // Load names from localStorage or use default if none exist
    let rowHeaderNames = JSON.parse(localStorage.getItem('attendanceNames')) || [
    ];
    console.log('report.js: rowHeaderNames:', rowHeaderNames);

    // Dynamically generate table rows
    function generateTableRows() {
        const tbody = document.getElementById('report-table-body');
        if (!tbody) {
            console.error('report.js: Table tbody not found');
            return;
        }
        tbody.innerHTML = ''; // Clear existing rows
        for (let i = 0; i < Math.min(rowHeaderNames.length, 18); i += 2) {
            // First row of the pair
            const row1 = document.createElement('tr');
            row1.innerHTML = `
                <td>${i + 1}.</td>
                <td>${rowHeaderNames[i]}</td>
                <td rowspan="2">${i + 1}.
                    <div class="signature-wrapper">
                        <div class="signature" data-name="${rowHeaderNames[i]}"></div>
                    </div>
                </td>
                <td rowspan="2">${rowHeaderNames[i + 1] ? `${i + 2}.` : ''}
                    <div class="signature-wrapper">
                        <div class="signature" data-name="${rowHeaderNames[i + 1] || ''}"></div>
                    </div>
                </td>
                <td>${i + 1}. <select class="keterangan" data-name="${rowHeaderNames[i]}">
                    <option value=""> </option>
                    <option value="I">I</option>
                    <option value="S">S</option>
                    <option value="TK">TK</option>
                </select></td>
            `;
            tbody.appendChild(row1);

            // Second row of the pair, if the next name exists
            if (rowHeaderNames[i + 1]) {
                const row2 = document.createElement('tr');
                row2.innerHTML = `
                    <td>${i + 2}.</td>
                    <td>${rowHeaderNames[i + 1]}</td>
                    <td>${i + 2}. <select class="keterangan" data-name="${rowHeaderNames[i + 1]}">
                        <option value=""> </option>
                        <option value="I">I</option>
                        <option value="S">S</option>
                        <option value="TK">TK</option>
                    </select></td>
                `;
                tbody.appendChild(row2);
            }
        }
        console.log('report.js: Table rows generated for', Math.min(rowHeaderNames.length, 18), 'names');

        // Re-attach event listeners for signatures and keterangan
        attachEventListeners();
    }

    // Set dynamic date
    function setDynamicDate() {
        const dateDiv = document.getElementById('report-date');
        if (dateDiv) {
            const today = new Date();
            const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jum\'at', 'Sabtu'];
            const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            const dayName = days[today.getDay()];
            const day = today.getDate();
            const month = months[today.getMonth()];
            const year = today.getFullYear();
            dateDiv.textContent = `${dayName}, ${day} ${month} ${year}`;
            console.log('report.js: Date set to:', dateDiv.textContent);
        } else {
            console.error('report.js: Report date div not found');
        }
    }

    function loadSignaturesAndKeterangan() {
        console.log('report.js: loadSignaturesAndKeterangan called');
        const data = JSON.parse(localStorage.getItem('spreadsheetData')) || {};
        console.log('report.js: localStorage data:', data);

        // Load signatures
        const signatureDivs = document.querySelectorAll('.signature');
        console.log('report.js: Found signature divs:', signatureDivs.length);
        signatureDivs.forEach(div => {
            const name = div.getAttribute('data-name');
            if (!name) {
                console.warn('report.js: Signature div missing data-name attribute', div);
                return;
            }
            console.log('report.js: Checking signature for:', name);

            const matchingKey = Object.keys(data).find(key => key.toLowerCase() === name.toLowerCase());
            if (matchingKey && data[matchingKey]?.image) {
                console.log('report.js: Found signature for:', matchingKey);
                const img = document.createElement('img');
                img.src = data[matchingKey].image;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                img.style.objectPosition = 'center';
                img.alt = `Signature for ${name}`;
                img.onerror = () => {
                    console.error('report.js: Failed to load image for:', name, 'URL:', img.src);
                    div.innerHTML = '<span style="color: red;">Image failed to load</span>';
                };
                img.onload = () => {
                    console.log('report.js: Image loaded successfully for:', name);
                };
                div.innerHTML = '';
                div.appendChild(img);
                console.log('report.js: Signature image added for:', name);
            } else {
                console.log('report.js: No signature found for:', name);
                div.innerHTML = '';
            }
        });

        // Load keterangan
        const keteranganSelects = document.querySelectorAll('.keterangan');
        console.log('report.js: Found keterangan selects:', keteranganSelects.length);
        keteranganSelects.forEach(select => {
            const name = select.getAttribute('data-name');
            if (!name) {
                console.warn('report.js: Keterangan select missing data-name attribute', select);
                return;
            }
            console.log('report.js: Checking keterangan for:', name);
            const matchingKey = Object.keys(data).find(key => key.toLowerCase() === name.toLowerCase());
            if (matchingKey && data[matchingKey]?.keterangan) {
                select.value = data[matchingKey].keterangan;
                console.log('report.js: Keterangan loaded for:', name, 'Value:', select.value);
            } else {
                select.value = '';
                console.log('report.js: No keterangan found for:', name);
            }
        });
    }

    function saveSignature(name, imageData) {
        console.log('report.js: saveSignature called for:', name);
        if (!imageData || !imageData.startsWith('data:image/')) {
            console.error('report.js: Invalid image data for:', name);
            return;
        }
        const data = JSON.parse(localStorage.getItem('spreadsheetData')) || {};
        data[name] = { ...data[name], image: imageData };
        try {
            localStorage.setItem('spreadsheetData', JSON.stringify(data));
            console.log('report.js: Signature saved for:', name);
            window.dispatchEvent(new CustomEvent('storageUpdate'));
        } catch (e) {
            console.error('report.js: Failed to save to localStorage:', e);
        }
    }

    function saveKeterangan(name, value) {
        console.log('report.js: saveKeterangan called for:', name, 'Value:', value);
        const data = JSON.parse(localStorage.getItem('spreadsheetData')) || {};
        data[name] = { ...data[name], keterangan: value };
        try {
            localStorage.setItem('spreadsheetData', JSON.stringify(data));
            console.log('report.js: Keterangan saved for:', name);
            window.dispatchEvent(new CustomEvent('storageUpdate'));
        } catch (e) {
            console.error('report.js: Failed to save to localStorage:', e);
        }
    }

    function clearSignaturesAndKeterangan() {
        console.log('report.js: clearSignaturesAndKeterangan called');
        localStorage.removeItem('spreadsheetData');
        document.querySelectorAll('.signature').forEach(div => {
            div.innerHTML = '';
        });
        document.querySelectorAll('.keterangan').forEach(select => {
            select.value = '';
        });
        window.dispatchEvent(new CustomEvent('storageUpdate'));
        console.log('report.js: All signatures and keterangan cleared and storageUpdate dispatched');
    }

    function downloadPaper() {
        console.log('report.js: downloadPaper called');
        const element = document.getElementById('report-container');

        const options = {
            scale: 3,
            useCORS: true,
            backgroundColor: null,
            width: element.offsetWidth,
            height: element.offsetHeight,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight
        };

        html2canvas(element, options).then(canvas => {
            const image = canvas.toDataURL('image/png');
            console.log('report.js: Canvas converted to image');
            const link = document.createElement('a');
            link.href = image;
            link.download = 'Attendance_Report_2025.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log('report.js: Image download triggered');
        }).catch(error => {
            console.error('report.js: Error generating image:', error);
            alert('Failed to generate image. Please try again.');
        });
    }

    // Attach event listeners for signatures and keterangan
    function attachEventListeners() {
        const fileInput = document.getElementById('signature-upload');
        if (fileInput) {
            fileInput.addEventListener('change', (event) => {
                console.log('report.js: File input changed');
                const file = event.target.files[0];
                if (file) {
                    if (!file.type.startsWith('image/')) {
                        console.error('report.js: Selected file is not an image:', file.name);
                        alert('Please select a valid image file.');
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const name = fileInput.dataset.name;
                        if (name) {
                            console.log('report.js: File read for:', name);
                            saveSignature(name, e.target.result);
                            loadSignaturesAndKeterangan();
                        } else {
                            console.error('report.js: No name associated with file input');
                        }
                    };
                    reader.onerror = () => {
                        console.error('report.js: Error reading file:', file.name);
                        alert('Failed to read the image file.');
                    };
                    reader.readAsDataURL(file);
                } else {
                    console.error('report.js: No file selected');
                }
            });
        } else {
            console.error('report.js: File input not found');
        }

        document.querySelectorAll('.signature').forEach(div => {
            div.addEventListener('click', () => {
                const name = div.getAttribute('data-name');
                console.log('report.js: Signature div clicked for:', name);
                if (name && fileInput) {
                    fileInput.dataset.name = name;
                    fileInput.click();
                } else {
                    console.error('report.js: Cannot trigger file input. Name:', name, 'FileInput:', fileInput);
                }
            });
        });

        document.querySelectorAll('.keterangan').forEach(select => {
            select.addEventListener('change', () => {
                const name = select.getAttribute('data-name');
                const value = select.value;
                console.log('report.js: Keterangan changed for:', name, 'Value:', value);
                if (name) {
                    saveKeterangan(name, value);
                } else {
                    console.error('report.js: Keterangan select missing data-name:', select);
                }
            });
        });
    }

    // Initial setup
    generateTableRows();
    setDynamicDate();
    loadSignaturesAndKeterangan();
    setTimeout(loadSignaturesAndKeterangan, 2000);

    // Event listeners for storage and names changes
    window.addEventListener('storage', () => {
        console.log('report.js: Storage event triggered');
        loadSignaturesAndKeterangan();
    });
    window.addEventListener('storageUpdate', () => {
        console.log('report.js: storageUpdate event triggered');
        loadSignaturesAndKeterangan();
    });
    window.addEventListener('namesUpdate', () => {
        console.log('report.js: namesUpdate event triggered');
        const newNames = JSON.parse(localStorage.getItem('attendanceNames')) || rowHeaderNames;
        rowHeaderNames.length = 0;
        rowHeaderNames.push(...newNames.slice(0, 18));
        generateTableRows();
        loadSignaturesAndKeterangan();
        console.log('reportAlbum.js: Table updated with new names:', rowHeaderNames);
    });

    // Clear signatures and keterangan button
    const clearButton = document.getElementById('clear-signatures');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all signatures and keterangan? This action cannot be undone.')) {
                clearSignaturesAndKeterangan();
            }
        });
    } else {
        console.error('report.js: Clear signatures button not found');
    }

    // Download paper button
    const downloadButton = document.getElementById('download-paper');
    if (downloadButton) {
        downloadButton.addEventListener('click', downloadPaper);
    } else {
        console.error('report.js: Download paper button not found');
    }
});
