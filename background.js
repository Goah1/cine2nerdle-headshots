// browser.runtime.onMessage.addListener((request, sender) => {
// 	if (request.action === 'fetchActorHeadshot') {
// 		return fetch(
// 			`https://api.themoviedb.org/3/search/person?api_key=${request.apiKey}&query=${encodeURIComponent(request.name)}`
// 		)
// 			.then(res => res.json())
// 			.then(data => ({
// 				name: request.name,
// 				imageUrl: data.results?.[0]?.profile_path
// 					? `https://image.tmdb.org/t/p/w500${data.results[0].profile_path}`
// 					: null,
// 			}))
// 			.catch(error => ({
// 				name: request.name,
// 				imageUrl: null,
// 				error: error.message,
// 			}));
// 	}
// });

browser.runtime.onMessage.addListener(async (request, sender) => {
	try {
		const res = await fetch(
			`https://api.themoviedb.org/3/search/person?api_key=${request.apiKey}&query=${encodeURIComponent(request.name)}`
		);

		const data = await res.json();

		return {
			name: request.name,
			imageUrl: data.results?.[0]?.profile_path
				? `https://image.tmdb.org/t/p/w500${data.results[0].profile_path}`
				: null,
			error: null,
		};
	} catch (error) {
		console.error(error);
		return {
			name: request.name,
			imageUrl: null,
			error: error.message,
		};
	}
});
