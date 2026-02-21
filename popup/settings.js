document.getElementById('settings-form').addEventListener('submit', e => {
	e.preventDefault(); // stops page reload

	const tmdbKey = document.getElementById('tmdb-key').value;

	browser.storage.local.set({ tmdbKey: tmdbKey });
});
