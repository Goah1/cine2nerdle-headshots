const API_KEY = CONFIG.TMDB_KEY;

let currentRound = '0';

let headshotElementArr = [];

// Watches for changes to the DOM
const observer = new MutationObserver(async mutations => {
	const currentRoundDiv = getCurrentRound();
	if (currentRoundDiv === null) return;
	// const actorLinkElement = getLinkElements(currentRoundDiv);
	const actorArr = getLinkActors(currentRoundDiv);
	const headshotArr = await fetchMultipleActorHeadshots(actorArr);
	// clearHeadshots();
	createHeadshotElements(headshotArr, actorArr);
});

observer.observe(document.body, {
	childList: true,
	subtree: true,
});

function getCurrentRound() {
	// LATEST ROUND WRAPPER
	const currentRoundDiv = document.querySelector(
		'#battle-board .flex.w-full.flex-col.items-center .mx-auto .relative.flex.w-full.flex-col'
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

function getLinkElements(currentRoundDiv) {
	const linkWrapperElement = currentRoundDiv.querySelector(
		'.absolute.left-1\\/2.top-1\\/2.-translate-x-1\\/2.-translate-y-1\\/2'
	);

	// console.log('LINK WRAPPER: ', linkWrapperElement);

	const links = linkWrapperElement.querySelectorAll('.mb-\\[3px\\]');

	console.log('LINK ELEMENTS: ', links);

	return links;
}

function getLinkActors(currentRoundDiv) {
	const actorLinks = currentRoundDiv.querySelectorAll(
		'.animate-link-films .oswald .text-white'
	);

	console.log(actorLinks);

	const actorArr = [];

	actorLinks.forEach(link => {
		actorArr.push({ name: link.innerText, element: link });
	});

	// console.log(actorArr.slice(0, 4));

	return actorArr.slice(0, 5);
}

async function fetchMultipleActorHeadshots(actorArr) {
	if (!actorArr || actorArr.length === 0) {
		// console.log('ACTOR ARRAY IS EMPTY');
		return [];
	}

	if (actorArr[0].name === 'ESCAPE' || actorArr[0].name === 'SKIP') {
		return [];
	}

	console.log('ACTOR ARRAY IS OKAY: ', actorArr);

	const promises = actorArr.map(actor =>
		browser.runtime
			.sendMessage({
				action: 'fetchActorHeadshot',
				name: actor.name,
				linkElement: actor.element,
				apiKey: API_KEY,
			})
			.catch(error => ({
				name: actor.name,
				imageUrl: null,
				linkElement: null,
				error: error.message,
			}))
	);

	const results = await Promise.all(promises);
	// console.log('Headshot results:', results);
	return results;
}

function createHeadshotElements(linkDataArr) {
	if (!linkDataArr || linkDataArr.length === 0) return;

	linkDataArr.forEach(link => {
		// CREATE THE WRAPPER
		const headshotWrapper = document.createElement('div');
		headshotWrapper.style.cssText = `
			display: flex;
			flex-direction: column;
			align-items: center;
			position: relative;
			height: 100px;
			width: auto;
			overflow: hidden;
		`;

		const headshotImg = document.createElement('img');
		headshotImg.src = link.imageUrl;
		headshotImg.style.cssText = `
			position: relative;
			height: 100%;
			width: auto;
		`;

		const headshotText = document.createElement('div');
		headshotText.textContent = link.name;
		headshotText.style.cssText = `
			z-index: 3;
			position: absolute;
			width: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			height: 18%;
			bottom: 0;
			left: 50%;
			transform: translateX(-50%);
			background-color: rgba(28, 28, 28, 0.9);
			color: white;
			font-size: 0.8em;
			text-align: center;
			font-family: Oswald;
		`;

		headshotWrapper.appendChild(headshotImg);

		headshotWrapper.appendChild(headshotText);

		link.nameElement.replaceWith(headshotWrapper);

		// wrapper.appendChild(headshotWrapper);

		headshotElementArr.push(headshotWrapper);
	});
	console.log('HEADSHOTS CREATED');
}

function clearHeadshots() {
	headshotElementArr.forEach(headshot => {
		headshot.remove();
	});
	headshotElementArr = [];
}
