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

	const linkDataObj = getLinkData(currentRoundDiv);
	if (!linkDataObj.linksWrapper || linkDataObj.linkData.length === 0) return;

	const headshotArr = await fetchMultipleActorHeadshots(linkDataObj);

	createLinkElements(linkDataObj, headshotArr);
});

observer.observe(document.body, {
	childList: true,
	subtree: true,
});

// Checks to see if the game has started
function isGameStarted() {
	return document.querySelector('#battle-board');
}

// Returns the current round div
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

// Returns an array of the link actors
function getLinkData(currentRoundDiv) {
	const linkDataObj = {
		linksWrapper: null,
		linkData: [],
	};

	const linksWrapper = currentRoundDiv.querySelector(
		'.absolute.left-1\\/2.top-1\\/2.-translate-x-1\\/2.-translate-y-1\\/2'
	);

	linkDataObj.linksWrapper = linksWrapper;

	// All links
	const linkElements = linksWrapper.querySelectorAll('.mb-\\[3px\\]');

	linkElements.forEach(link => {
		const data = { name: '', xCount: 0 };

		// Gets the used X elements
		const xCountElements = link.querySelectorAll('.text-gradientYellow');

		data.xCount = xCountElements.length;

		// Gets the actor name element
		const actorNameElement = link.querySelector(
			'.oswald .mr-\\[5px\\].text-\\[12px\\].text-white.laptop\\:text-\\[13px\\]'
		);

		data.name = actorNameElement.innerText;

		data.element = link;

		linkDataObj.linkData.push(data);
	});

	return linkDataObj;
}

// TMBD fetch for the actor headshots
// Returns an array of headshot + name
async function fetchMultipleActorHeadshots(linkDataObj) {
	if (
		linkDataObj.linkData[0].name === 'ESCAPE' ||
		linkDataObj.linkData[0].name === 'SKIP'
	) {
		return [];
	}

	const promises = linkDataObj.linkData.map(link =>
		browser.runtime.sendMessage({
			name: link.name,
			action: 'fetchActorHeadshot',
			apiKey: API_KEY,
		})
	);

	const results = await Promise.all(promises);
	return results;
}

// Create new link elements
function createLinkElements(linkDataObj, headshotArr) {
	console.log('linkDataObj: ', linkDataObj);
	console.log('headshotArr: ', headshotArr);
}
