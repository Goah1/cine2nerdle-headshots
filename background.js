browser.runtime.onMessage.addListener((request, sender) => {
	if (request.action === 'fetchActorHeadshot') {
		return fetch(
			`https://api.themoviedb.org/3/search/person?api_key=${request.apiKey}&query=${encodeURIComponent(request.name)}`
		)
			.then(res => res.json())
			.then(data => ({
				name: request.name,
				imageUrl: data.results?.[0]?.profile_path
					? `https://image.tmdb.org/t/p/w500${data.results[0].profile_path}`
					: null,
			}))
			.catch(error => ({
				name: request.name,
				imageUrl: null,
				error: error.message,
			}));
	}
});
