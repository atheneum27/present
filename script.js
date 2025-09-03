document.addEventListener('DOMContentLoaded', () => {
  console.log('names.js: DOM loaded');
  
  const tableBody = document.getElementById('namesTableBody');
  const form = document.getElementById('namesForm');
  const clearButton = document.getElementById('clearNames');
  const maxRows = 18; // Maximum number of names allowed
  
  // Function to populate the table with input fields
  function populateTable() {
    tableBody.innerHTML = ''; // Clear existing rows
    const savedNames = JSON.parse(localStorage.getItem('attendanceNames')) || [];
    for (let i = 0; i < maxRows; i++) {
      const row = document.createElement('tr');
      row.innerHTML = `
                <td>${i + 1}.</td>
                <td><input type="text" class="name-input" value="${savedNames[i] || ''}" maxlength="50"></td>
            `;
      tableBody.appendChild(row);
    }
    console.log('names.js: Table populated with', maxRows, 'rows');
  }
  
  // Function to save names to localStorage
  function saveNames() {
    const inputs = document.querySelectorAll('.name-input');
    const names = Array.from(inputs)
      .map(input => input.value.trim())
      .filter(name => name !== '') // Only save non-empty names
      .slice(0, 18); // Limit to 18 names
    if (names.length === 0) {
      alert('Please enter at least one name.');
      console.warn('names.js: No valid names to save');
      return;
    }
    localStorage.setItem('attendanceNames', JSON.stringify(names));
    console.log('names.js: Names saved to localStorage:', names);
    alert('Names saved successfully! They will appear in the attendance report and signature form.');
    window.dispatchEvent(new CustomEvent('namesUpdate')); // Trigger custom event
  }
  
  // Function to clear names from localStorage and table
  function clearNames() {
    if (confirm('Are you sure you want to clear all names? This action cannot be undone.')) {
      localStorage.removeItem('attendanceNames');
      populateTable();
      window.dispatchEvent(new CustomEvent('namesUpdate'));
      console.log('names.js: Names cleared and namesUpdate dispatched');
    }
  }
  
  // Event listener for form submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      saveNames();
    });
  } else {
    console.error('names.js: Names form not found');
  }
  
  // Event listener for clear button
  if (clearButton) {
    clearButton.addEventListener('click', clearNames);
  } else {
    console.error('names.js: Clear names button not found');
  }
  
  // Initial population of the table
  populateTable();
});
