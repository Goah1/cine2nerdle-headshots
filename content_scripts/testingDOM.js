const API_KEY = CONFIG.TMDB_KEY;

const LINK_WRAPPER_HEIGHT = 200;

const LINK_WRAPPER_PADDING = 10;

let HEADSHOT_HEIGHT = 90;

let currentRound = '0';

let headshotElementArr = [];

const MAX_HEADSHOT_ARRAY_LENGTH = 3;

const MAX_LINK_AREA = 225;

// Watches for changes to the DOM
const observer = new MutationObserver(async mutations => {
	if (!isGameStarted()) return;

	const currentRoundDiv = getCurrentRound();
	if (currentRoundDiv === null) return;

	const actorArr = getLinkActors(currentRoundDiv);
	if (!actorArr || actorArr.length === 0) return;

	const headshotArr = await fetchMultipleActorHeadshots(actorArr);

	createHeadshotElements(actorArr, headshotArr);
});

observer.observe(document.body, {
	childList: true,
	subtree: true,
});

// Checks to see if the game has started
function isGameStarted() {
	return document.querySelector('#battle-board');
}

function increaseBetweenRoundAreaHeight() {
	const linkContainer = document.querySelector('.animate-link-films');
	console.log('LINK CONTAINER: ', linkContainer);
	linkContainer.style.cssText = `height: 315px;`;
}

function increaseLinkWrapperHeight() {
	const linkWrapper = document.querySelector(
		'.custom-scrollbar.max-h-\\[100px\\].overflow-y-auto.overflow-x-hidden.pr-\\[5px\\]'
	);

	linkWrapper.style.cssText = `max-height: ${LINK_WRAPPER_HEIGHT}px`;
}

function calculateHeadshotHeight(actorArrLength) {
	if (actorArrLength === 1) {
		HEADSHOT_HEIGHT = 130;
		return;
	}

	if (actorArrLength === 2) {
		HEADSHOT_HEIGHT = 85;
		return;
	}

	if (actorArrLength === 3) {
		HEADSHOT_HEIGHT = 60;
		return;
	}

	if (actorArrLength >= 4) {
		HEADSHOT_HEIGHT = 85;
		return;
	}
}

function getCurrentRound() {
	const currentRoundDiv = document.querySelector(
		'.mx-auto .flex.w-full.flex-col.items-center .relative.flex.w-full.max-w-\\[350px\\].flex-col.s500\\:w-\\[350px\\].laptop\\:w-\\[400px\\].laptop\\:max-w-\\[400px\\]'
	);

	const roundDiv = currentRoundDiv.querySelector(
		'.inter.left-\\[10px\\].top-\\[-21px\\].mb-\\[2px\\].w-\\[95\\%\\].text-\\[10px\\].text-lightGrayText\\/75'
	);

	const roundText = roundDiv.textContent;

	const newRound = parseInt(roundText.split(' ')[1]);

	if (newRound === 1) {
		currentRound = newRound;
		console.log('NEW GAME');
		return currentRoundDiv;
	} else if (newRound > currentRound) {
		currentRound = newRound;
		console.log('NEW ROUND: ', newRound);
		return currentRoundDiv;
	} else {
		return null;
	}
}

function getLinkActors(currentRoundDiv) {
	const actorNameElements = currentRoundDiv.querySelectorAll(
		'.animate-link-films .oswald .text-white'
	);

	const actorArr = [];

	actorNameElements.forEach(actorName => {
		actorArr.push({ name: actorName.innerText, element: actorName });
	});

	calculateHeadshotHeight(actorArr.length);

	if (actorArr.length >= 4) increaseLinkWrapperHeight();

	return actorArr.slice(0, MAX_HEADSHOT_ARRAY_LENGTH);
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
	console.log('Headshot results:', results);
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
			height: ${HEADSHOT_HEIGHT}px;
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
			font-size: ${actorArr.length === 1 ? 0.9 : 0.7}em;
			text-align: center;
			font-family: Oswald;
		`;

		headshotWrapper.appendChild(headshotImg);

		headshotWrapper.appendChild(headshotText);

		actorArr[index].element.replaceWith(headshotWrapper);

		// wrapper.appendChild(headshotWrapper);
	});
}
