const API_KEY = CONFIG.TMDB_KEY;

let currentRound = '0';

const singleHeadshotHeight = 24;

let testingHeadshots = [
	{
		name: 'JARED',
		imageUrl: 'https://image.tmdb.org/t/p/w500/qjhNKsw0OLyZQgK4srhelBafcCf.jpg',
	},
	{
		name: 'NORB',
		imageUrl: 'https://image.tmdb.org/t/p/w500/qjhNKsw0OLyZQgK4srhelBafcCf.jpg',
	},
];

let headshotElementArr = [];

// WRAPPER
const wrapper = document.createElement('div');
wrapper.style.cssText = `
            z-index: 99999;
			position: fixed;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: space-evenly;
			top: 50%;
			transform: translateY(-50%);
			right: 10%;
			height: ${testingHeadshots * singleHeadshotHeight}vh;
			width: auto;
`;
document.body.appendChild(wrapper);

// Watches for changes to the DOM
const observer = new MutationObserver(async mutations => {
	const currentRoundDiv = getCurrentRound();
	if (currentRoundDiv === null) return;
	const actorLinkElement = getLinkElements(currentRoundDiv);
	// const actorArr = getLinkActors(currentRoundDiv);
	// const headshotArr = await fetchMultipleActorHeadshots(actorArr);
	// clearHeadshots();
	// createHeadshotElements(headshotArr);
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

	console.log('CURRENT ROUND: ', currentRoundDiv);

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

	// console.log('LINK ELEMENTS: ', links);

	// linkElement.replaceWith(testDiv);

	return links;
}

function getLinkActors(currentRoundDiv) {
	const actorLinks = currentRoundDiv.querySelectorAll(
		'.animate-link-films .oswald .text-white'
	);

	console.log(actorLinks);

	const actorArr = [];

	actorLinks.forEach(link => {
		actorArr.push(link.innerText);
	});

	console.log(actorArr.slice(0, 4));

	return actorArr.slice(0, 4);
}

async function fetchMultipleActorHeadshots(actorArr) {
	if (!actorArr || actorArr.length === 0) {
		// console.log('ACTOR ARRAY IS EMPTY');
		return [];
	}

	if (actorArr[0] === 'ESCAPE' || actorArr[0] === 'SKIP') {
		return [];
	}

	console.log('ACTOR ARRAY IS OKAY: ', actorArr);

	const promises = actorArr.map(name =>
		browser.runtime
			.sendMessage({
				action: 'fetchActorHeadshot',
				name: name,
				apiKey: API_KEY,
			})
			.catch(error => ({
				name: name,
				imageUrl: null,
				error: error.message,
			}))
	);

	const results = await Promise.all(promises);
	console.log('Headshot results:', results);
	return results;
}

function createHeadshotElements(headshotArr) {
	if (!headshotArr || headshotArr.length === 0) {
		console.log('ACTOR ARRAY IS EMPTY OR NULL');
		return;
	} else {
		console.log(headshotArr);
	}

	headshotArr.forEach(headshot => {
		// CREATE THE WRAPPER
		const headshotWrapper = document.createElement('div');
		headshotWrapper.style.cssText = `
			display: flex;
			flex-direction: column;
			align-items: center;
			position: relative;
			height: ${singleHeadshotHeight}vh;
			width: auto;
			--tw-shadow: 0px 0px 8px 0px rgb(99,197,218);
			--tw-shadow-colored: 0px 0px 8px 0px var(--tw-shadow-color);
			box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow);
			--tw-border-opacity: 1;
			border: 2px solid rgb(99 197 218 / var(--tw-border-opacity));
			border-radius: 10px;
			overflow: hidden;
			margin-bottom: 5px;
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

		wrapper.appendChild(headshotWrapper);

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
