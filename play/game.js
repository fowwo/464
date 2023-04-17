import { parseBoard, displayBoard, findWordPaths, extendPath, pathString, drawPath, clearPath  } from "../assets/scripts/board.js";

const board = [];

let paths = [];
let pathIndex = 0;

// Keyboard controls
document.addEventListener("keydown", (event) => {
	const key = event.key;
	if (key.match(/^[A-Za-z]$/)) {
		const letterIsAdded = addLetter(key);
		if (letterIsAdded) {
			clearPath();
			drawPath(paths[pathIndex]);
		}
		return;
	}

	switch (key) {
		case "Backspace":
			const letterIsRemoved = removeLetter();
			if (letterIsRemoved) {
				clearPath();
				if (paths.length > 0) drawPath(paths[pathIndex]);
			}
			return;
		case "Shift":
		case " ":
			const isNewPath = switchPath();
			if (isNewPath) {
				clearPath();
				drawPath(paths[pathIndex]);
			}
			return;
		case "Escape":
			cancelPath();
			clearPath();
			return;
		case "Enter":
			// TODO: Implement word submission.
			submitPath();
			clearPath();
			return;
	}
});

function addLetter(key) {
	if (paths.length === 0) {
		paths = extendPath([], key, board);
		pathIndex = 0;
		return paths.length > 0;
	}

	// Extend the current path if possible.
	const path = paths[pathIndex];
	const extendList = extendPath(path, key, board);
	if (extendList.length > 0) {
		paths = extendList;
		pathIndex = 0;
		return true;
	}

	// Look for another path.
	const word = pathString(path, board);
	const wordList = findWordPaths(word + key, board);
	if (wordList.length === 0) return false;

	// Use the newly found path.
	const newPath = wordList[0].slice(0, -1);
	paths = extendPath(newPath, key, board);
	pathIndex = 0;
	return true;
}

function removeLetter() {
	if (paths.length === 0) return false;
	
	pathIndex = 0; 
	const path = paths[0].slice(0, -1);
	if (path.length === 0) {
		paths = [];
		return true;
	}

	const [ r, c ] = path.at(-1);
	paths = extendPath(path.slice(0, -1), board[r][c], board);
	return true;
}

function switchPath() {
	pathIndex = (pathIndex + 1) % paths.length;
	return paths.length > 1;
}

function cancelPath() {
	const b = paths.length > 0;
	paths = [];
	pathIndex = 0;
	return b;
}