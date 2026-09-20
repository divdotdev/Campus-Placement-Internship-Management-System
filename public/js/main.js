/**
 * Campus Placement & Internship Management System
 * Client-side script for interactive feedback, modal triggers, and form helpers
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Bootstrap Tooltips if available
  if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));
  }

  // 2. Drive Type Toggle for Package vs Stipend
  const driveTypeSelect = document.getElementById('driveTypeSelect');
  const packageContainer = document.getElementById('packageContainer');
  const stipendContainer = document.getElementById('stipendContainer');

  if (driveTypeSelect && packageContainer && stipendContainer) {
    const handleTypeChange = () => {
      if (driveTypeSelect.value === 'Internship') {
        stipendContainer.style.display = 'block';
        packageContainer.style.display = 'none';
      } else {
        stipendContainer.style.display = 'none';
        packageContainer.style.display = 'block';
      }
    };
    driveTypeSelect.addEventListener('change', handleTypeChange);
    handleTypeChange(); // Run on initial load
  }

  // 3. Confirm Auto-Shortlist Action
  const autoShortlistForms = document.querySelectorAll('.auto-shortlist-form');
  autoShortlistForms.forEach((form) => {
    form.addEventListener('submit', (e) => {
      const confirmed = window.confirm(
        'Are you sure you want to auto-shortlist all eligible applicants currently in "Applied" status? This action will advance their stage to "Shortlisted".'
      );
      if (!confirmed) {
        e.preventDefault();
      }
    });
  });

  // 4. Confirm Deletion
  const deleteForms = document.querySelectorAll('.confirm-delete-form');
  deleteForms.forEach((form) => {
    form.addEventListener('submit', (e) => {
      const message = form.getAttribute('data-confirm-message') || 'Are you sure you want to delete this record? This action cannot be undone.';
      if (!window.confirm(message)) {
        e.preventDefault();
      }
    });
  });

  // 5. Client-Side Quick Table Filter
  const tableSearchInput = document.getElementById('tableSearchInput');
  if (tableSearchInput) {
    tableSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const rows = document.querySelectorAll('.searchable-table tbody tr');
      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }
});
