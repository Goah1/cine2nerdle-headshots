// async function fetchMultipleActorHeadshots(actorArr) {
// 	if (!actorArr || actorArr.length === 0) {
// 		console.log('ACTOR ARRAY IS FALSE');
// 		return;
// 	} else {
// 		console.log('ACTOR ARRAY IS OKAY: ', actorArr);
// 	}

// 	const promises = actorArr.map(name =>
// 		fetch(
// 			`https://api.themoviedb.org/3/search/person?api_key=${API_KEY}&query=${encodeURIComponent(name)}`
// 		)
// 			.then(res => res.json())
// 			.then(data => ({
// 				name: name,
// 				imageUrl: data.results?.[0]?.profile_path
// 					? `https://image.tmdb.org/t/p/w500${data.results[0].profile_path}`
// 					: null,
// 			}))
// 			.catch(error => ({
// 				name: name,
// 				imageUrl: null,
// 				error: error.message,
// 			}))
// 	);

// 	return await Promise.all(promises);
// }

// async function fetchSingleActorHeadshot(actorArr) {
// 	if (!actorArr) {
// 		console.log('ACTOR ARRAY IS FALSE');
// 		return;
// 	}

// 	try {
// 		const searchResponse = await fetch(
// 			`https://api.themoviedb.org/3/search/person?api_key=${API_KEY}&query=${encodeURIComponent(actorArr[0])}`
// 		);

// 		const data = await searchResponse.json();

// 		if (data.results && data.results.length > 0 && data.results[0].profile_path) {
// 			console.log(`https://image.tmdb.org/t/p/w500${data.results[0].profile_path}`);
// 			return `https://image.tmdb.org/t/p/w500${data.results[0].profile_path}`;
// 		}

// 		return null;
// 	} catch (error) {
// 		console.error('Error fetching headshot:', error);
// 		return null;
// 	}
// }
