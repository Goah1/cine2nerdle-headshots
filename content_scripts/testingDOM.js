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
		const data = { name: '', xCount: 0, linkIcon: null };

		// Gets the used X elements
		const xCountElements = link.querySelectorAll('.text-gradientYellow');

		// Gets the link icon
		const linkIcon = link.querySelector(
			'.fa-solid.fa-link.mr-\\[5px\\].text-\\[13px\\].laptop\\:text-\\[14px\\]'
		);

		data.linkIcon = linkIcon;

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

	const linkParentWrapper = document.createElement('div');
	linkParentWrapper.classList.add('link-parent-wrapper');

	linkDataObj.linkData.forEach((link, index) => {
		const linkWrapper = document.createElement('div');
		linkWrapper.classList.add('link-wrapper');

		// NO BRANCH FOR THE LAST ONE IF THE ARR IS UNEVEN
		if (
			linkDataObj.linkData.length % 2 === 1 &&
			linkDataObj.linkData.length === index + 1
		) {
			console.log('no branch');
		} else {
			const branch = document.createElement('div');
			branch.classList.add(`${index % 2 === 0 ? 'right-branch' : 'left-branch'}`);
			linkWrapper.appendChild(branch);
		}

		const xWrapper = document.createElement('div');
		xWrapper.classList.add('x-wrapper');

		for (let i = 0; i < link.xCount; i++) {
			const x = document.createElement('div');
			x.classList.add('x-used');
			xWrapper.appendChild(x);
		}

		const iconWrapper = document.createElement('div');
		iconWrapper.classList.add('icon-wrapper');
		link.linkIcon.classList.remove('mr-[5px]');
		if (link.linkIcon) {
			iconWrapper.appendChild(link.linkIcon);
		}

		// Checks if the img is available;
		if (headshotArr[index].imageUrl === null) {
			const noImgAvailable = document.createElement('div');
			noImgAvailable.classList.add('no-img-available');
			linkWrapper.appendChild(noImgAvailable);
		} else {
			const headshotImg = document.createElement('img');
			headshotImg.src = headshotArr[index].imageUrl;
			headshotImg.classList.add(
				`${link.xCount === 3 && 'dead-link'}`,
				'headshot-img'
			);
			linkWrapper.appendChild(headshotImg);
		}

		const nameWrapper = document.createElement('div');
		nameWrapper.classList.add('name-wrapper');

		const name = document.createElement('div');
		name.textContent = link.name;
		name.classList.add('name');

		nameWrapper.appendChild(name);

		linkWrapper.appendChild(iconWrapper);
		linkWrapper.appendChild(xWrapper);
		linkWrapper.appendChild(nameWrapper);

		linkParentWrapper.appendChild(linkWrapper);
	});

	linkDataObj.linksWrapper.replaceWith(linkParentWrapper);
}

// function createHeadshotElements(actorArr, headshotArr) {
// 	headshotArr.forEach((headshot, index) => {
// 		// CREATE THE HEADSHOT WRAPPER
// 		const headshotWrapper = document.createElement('div');

// 		// 225 is the max height of the link space
// 		headshotWrapper.style.cssText = `
// 			display: flex;
// 			flex-direction: column;
// 			align-items: center;
// 			position: relative;
// 			height: ${HEADSHOT_HEIGHT}px;
// 			width: auto;
// 			border-radius: 5px;
// 			overflow: hidden;
// 			margin-left: 10px;
// 		`;

// 		const headshotImg = document.createElement('img');
// 		headshotImg.src = headshot.imageUrl;
// 		headshotImg.style.cssText = `
// 			position: relative;
// 			height: 100%;
// 			width: auto;
// 		`;

// 		const headshotText = document.createElement('div');
// 		headshotText.textContent = headshot.name;
// 		headshotText.style.cssText = `
// 			z-index: 3;
// 			position: absolute;
// 			width: 100%;
// 			height: auto;
// 			display: flex;
// 			align-items: center;
// 			justify-content: center;
// 			bottom: 0;
// 			left: 50%;
// 			transform: translateX(-50%);
// 			background-color: rgba(28, 28, 28, 0.9);
// 			color: white;
// 			font-size: ${actorArr.length === 1 ? 0.9 : 0.7}em;
// 			text-align: center;
// 			font-family: Oswald;
// 		`;

// 		headshotWrapper.appendChild(headshotImg);

// 		headshotWrapper.appendChild(headshotText);

// 		actorArr[index].element.replaceWith(headshotWrapper);

// 		// wrapper.appendChild(headshotWrapper);
// 	});
// }
