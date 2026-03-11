const btn = document.getElementById('healthBtn');
const result = document.getElementById('healthResult');
const apiBase = document.getElementById('apiBase');

btn?.addEventListener('click', async () => {
  result.textContent = 'Checking...';

  try {
    const response = await fetch(`${apiBase.value}/health`);
    const data = await response.json();
    result.textContent = `Status: ${data.status}`;
    result.style.color = '#16a34a';
  } catch (error) {
    result.textContent = 'Failed to connect to backend API.';
    result.style.color = '#dc2626';
  }
});
