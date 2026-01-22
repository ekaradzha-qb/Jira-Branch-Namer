// Apply dark theme synchronously from localStorage cache
if (localStorage.getItem('darkTheme') === 'true') {
  document.documentElement.classList.add('dark-theme');
}
