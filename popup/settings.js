// Set the display key on load
browser.storage.local.get('tmdbKey').then(result => {
	if (result.tmdbKey) {
		document.getElementById('key-status-text').textContent = 'TMDB key is good';
		document.getElementById('key-status-indicator').style.cssText =
			`background-color: green;`;
	} else {
		document.getElementById('key-status-text').textContent = 'TMDB key is bad';
		document.getElementById('key-status-indicator').style.cssText =
			`background-color: red;`;
	}
});

document.getElementById('settings-form').addEventListener('submit', e => {
	e.preventDefault(); // stops page reload

	const tmdbKey = document.getElementById('tmdb-key').value;

	browser.storage.local.set({ tmdbKey: tmdbKey });

	console.log('KEY SET: ', tmdbKey);
});
