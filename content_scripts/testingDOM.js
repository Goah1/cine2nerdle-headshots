const API_KEY = CONFIG.TMDB_KEY;

let currentRound = '0';

let headshotElementArr = [];

// Watches for changes to the DOM
const observer = new MutationObserver(async mutations => {
	console.log('CURRENT ROUND: ', currentRound);
	const currentRoundDiv = getCurrentRound();
	if (currentRoundDiv === null) return;

	const actorArr = getLinkActors(currentRoundDiv);
	if (!actorArr || actorArr.length === 0) return;

	if (actorArr.length >= 4) {
		increaseLinkHeight();
	}

	const headshotArr = await fetchMultipleActorHeadshots(actorArr);
	createHeadshotElements(actorArr, headshotArr);
});

observer.observe(document.body, {
	childList: true,
	subtree: true,
});

function increaseLinkHeight() {
	const linkWrapper = document.querySelector(
		'.custom-scrollbar.max-h-\\[100px\\].overflow-y-auto.overflow-x-hidden.pr-\\[5px\\]'
	);
	linkWrapper.style.cssText = `max-height: 175px`;
}

function getCurrentRound() {
	// LATEST ROUND WRAPPER
	// const currentRoundDiv = document.querySelector(
	// 	'#battle-board .flex.w-full.flex-col.items-center .mx-auto .relative.flex.w-full.flex-col'
	// );

	const currentRoundDiv = document.querySelector(
		'.mx-auto .flex.w-full.flex-col.items-center .relative.flex.w-full.max-w-\\[350px\\].flex-col.s500\\:w-\\[350px\\].laptop\\:w-\\[400px\\].laptop\\:max-w-\\[400px\\]'
	);

	// console.log('CURRENT ROUND: ', currentRoundDiv);

	// ROUND TEXT DIV
	const roundDiv = currentRoundDiv.querySelector(
		'.inter.left-\\[10px\\].top-\\[-21px\\].mb-\\[2px\\].w-\\[95\\%\\].text-\\[10px\\].text-lightGrayText\\/75'
	);

	// console.log('ROUND: ', roundDiv);

	const roundText = roundDiv.textContent;

	if (roundText > currentRound) {
		currentRound = roundText;
		// console.log('NEW ROUND: ', roundText);
		return currentRoundDiv;
	} else {
		return null;
	}
}

function getLinkActors(currentRoundDiv) {
	const actorNameElements = currentRoundDiv.querySelectorAll(
		'.animate-link-films .oswald .text-white'
	);

	// console.log(actorNameElements);

	const actorArr = [];

	actorNameElements.forEach(actorName => {
		actorArr.push({ name: actorName.innerText, element: actorName });
	});

	// console.log(actorArr.slice(0, 5));

	return actorArr.slice(0, 5);
}

async function fetchMultipleActorHeadshots(actorArr) {
	if (actorArr[0].name === 'ESCAPE' || actorArr[0].name === 'SKIP') {
		return [];
	}

	// console.log('ACTOR ARRAY IS OKAY: ', actorArr);

	const promises = actorArr.map(actor =>
		browser.runtime
			.sendMessage({
				action: 'fetchActorHeadshot',
				name: actor.name,
				apiKey: API_KEY,
			})
			.catch(error => ({
				name: actor.name,
				imageUrl: null,
				error: error.message,
			}))
	);

	const results = await Promise.all(promises);
	// console.log('Headshot results:', results);
	return results;
}

function createHeadshotElements(actorArr, headshotArr) {
	headshotArr.forEach((headshot, index) => {
		// CREATE THE HEADSHOT WRAPPER
		const headshotWrapper = document.createElement('div');
		// 225 is the max height of the link space
		headshotWrapper.style.cssText = `
			display: flex;
			flex-direction: column;
			align-items: center;
			position: relative;
			height: ${headshotArr.length === 3 ? 200 / 3 : 90}px;
			width: auto;
			border-radius: 5px;
			overflow: hidden;
			margin-left: 10px;
		`;

		const headshotImg = document.createElement('img');
		headshotImg.src = headshot.imageUrl;
		headshotImg.style.cssText = `
			position: relative;
			height: 100%;
			width: auto;
		`;

		const headshotText = document.createElement('div');
		headshotText.textContent = headshot.name;
		headshotText.style.cssText = `
			z-index: 3;
			position: absolute;
			width: 100%;
			height: auto;
			display: flex;
			align-items: center;
			justify-content: center;
			bottom: 0;
			left: 50%;
			transform: translateX(-50%);
			background-color: rgba(28, 28, 28, 0.9);
			color: white;
			font-size: ${headshotArr.length === 3 ? 0.55 : 0.7}em;
			text-align: center;
			font-family: Oswald;
		`;

		headshotWrapper.appendChild(headshotImg);

		headshotWrapper.appendChild(headshotText);

		actorArr[index].element.replaceWith(headshotWrapper);

		// wrapper.appendChild(headshotWrapper);
	});
}
