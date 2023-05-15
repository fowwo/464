import { parseBoard, createBoard, solve, findWordPaths, extendPath, pathString, drawPath, clearPath } from "../assets/scripts/board.js";

let board, context;
let paths = [];
let pathIndex = 0;

// Manual puzzle creation form
document.getElementById("puzzle-input").onsubmit = (event) => {
	event.preventDefault();

	const errorMessage = event.target.querySelector("#error-message");

	// Parse board
	try {
		board = parseBoard(event.target.querySelector("textarea").value);
		errorMessage.style.display = "none";
	} catch (error) {
		errorMessage.innerText = error;
		errorMessage.style.display = "";
		return;
	}

	// Hide input form
	document.getElementById("puzzle-input").style.display = "none";
	
	// Sort by word length and then by alphabetic order.
	const solution = Object.entries(solve(board)).sort(([a], [b]) => {
		if (a.length < b.length) return -1;
		else if (a.length > b.length) return 1;
		else if (a < b) return -1;
		else if (a > b) return 1;
		return 0;
	});

	// Find letter counts.
	const totalCount = Array(board.length).fill().map(() => Array(board[0].length).fill(0));
	const startCount = Array(board.length).fill().map(() => Array(board[0].length).fill(0));
	for (const [ word, path ] of solution) {
		const [ r, c ] = path[0].split(",").map(x => parseInt(x));
		totalCount[r][c]++;
		startCount[r][c]++;
		for (let i = 1; i < path.length; i++) {
			const [ r, c ] = path[i].split(",").map(x => parseInt(x));
			totalCount[r][c]++;
		}
	}
	const boardContainer = createBoard(board, totalCount, startCount);
	context = boardContainer.querySelector("canvas").getContext("2d");
	document.getElementById("board-container").replaceWith(boardContainer);

	document.getElementById("word-count").innerText = `0 / ${solution.length} word${solution.length === 1 ? "" : "s"}`;
	
	// Display word counts by letter
	const wordBox = document.getElementById("words");
	wordBox.innerHTML = "";
	let length, ul;
	let count = 0;
	for (const [ word, path ] of solution) {
		if (word.length !== length) {
			if (length) {
				const remaining = document.createElement("span");
				remaining.id = `remaining-word-count-${length}`;
				remaining.style.color = "var(--accent-color)";
				remaining.innerText = `+${count} word${count === 1 ? "" : "s"}`;
				count = 0;
				wordBox.appendChild(remaining);
			}
			length = word.length;

			const h3 = document.createElement("h3");
			h3.innerText = `${length} letter${length === 1 ? "" : "s"}`;
			wordBox.appendChild(h3);
			ul = document.createElement("ul");
			wordBox.appendChild(ul);
		}
		
		const li = document.createElement("li");
		li.id = `word-list-${word}`;
		li.style.display = "none";
		li.innerText = word;
		ul.appendChild(li);
		count++;
	}

	const remaining = document.createElement("span");
	remaining.id = `remaining-word-count-${length}`;
	remaining.style.color = "var(--accent-color)";
	remaining.innerText = `+${count} word${count === 1 ? "" : "s"}`;
	wordBox.appendChild(remaining);
};

// Keyboard controls
document.addEventListener("keydown", (event) => {
	if (!board) return;

	const key = event.key;
	if (key.match(/^[A-Za-z]$/)) {
		const letterIsAdded = addLetter(key);
		if (letterIsAdded) {
			clearPath(context);
			drawPath(context, paths[pathIndex]);
		}
		return;
	}

	switch (key) {
		case "Backspace":
			const letterIsRemoved = removeLetter();
			if (letterIsRemoved) {
				clearPath(context);
				if (paths.length > 0) drawPath(context, paths[pathIndex]);
			}
			return;
		case "Shift":
		case " ":
			const isNewPath = switchPath();
			if (isNewPath) {
				clearPath(context);
				drawPath(context, paths[pathIndex]);
			}
			return;
		case "Escape":
			cancelPath();
			clearPath(context);
			return;
		case "Enter":
			submitPath();
			clearPath(context);
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
	
	const path = paths[0].slice(0, -1);
	if (path.length === 0) {
		paths = [];
		pathIndex = 0;
		return true;
	}

	const [ r, c ] = path.at(-1);
	paths = extendPath(path.slice(0, -1), board[r][c], board);
	pathIndex = paths.findIndex(path => {
		const [ a, b ] = path.at(-1);
		return a === r && b === c;
	});
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

function submitPath() {
	if (paths.length === 0) return false;

	const path = paths[pathIndex];
	const word = path.map(([ r, c ]) => board[r][c]).join("");
	cancelPath();

	// Check if the path is a word.
	const wordElement = document.getElementById(`word-list-${word}`);
	if (!wordElement) {
		document.getElementById("response").innerText = "Not a word";
		return false;
	}

	// Check if the word is already found.
	if (wordElement.style.display !== "none") {
		document.getElementById("response").innerText = "Already found";
		return false;
	}

	// A new word is found.
	wordElement.style.display = "";
	const count = parseInt(document.getElementById("word-count").innerText.split(" ")[0]) + 1;
	const total = parseInt(document.getElementById("word-count").innerText.split(" ")[2]);

	document.getElementById("word-count").innerText = `${count} / ${total} word${total === 1 ? "" : "s"}`;
	document.querySelector("#progress > div").style.width = `${100 * count / total}%`;
	document.getElementById("response").innerText = `+${word.length} point${word.length === 1 ? "" : "s"}`;

	// Update remaining word count in word list.
	const remaining = parseInt(document.getElementById(`remaining-word-count-${word.length}`).innerText.split(" ")[0].slice(1)) - 1;
	if (remaining) {
		document.getElementById(`remaining-word-count-${word.length}`).innerText = `+${remaining} word${remaining === 1 ? "" : "s"}`;
	} else {
		document.getElementById(`remaining-word-count-${word.length}`).style.display = "none";
	}

	// Update letter counts.
	const boardElement = document.getElementById("board");
	const getCell = (r, c) => boardElement.children.item(r * board.length + c);
	const decrementStartCount = (cell) => {
		const text = cell.firstElementChild.children.item(1);
		const value = parseInt(text.innerHTML) - 1;
		text.innerHTML = value > 0 ? value : "";
	};
	const decrementTotalCount = (cell) => {
		console.log(cell);
		const text = cell.firstElementChild.children.item(2);
		const value = parseInt(text.innerHTML) - 1;
		text.innerHTML = value > 0 ? value : "";
		if (value === 0) cell.style.opacity = 0.2;
	};
	decrementStartCount(getCell(...path[0]));
	for (const [ r, c ] of path) {
		decrementTotalCount(getCell(r, c));
	}

	// Reveal letter count hints.
	if (count === total) {
		// 100% - All required words found.
		document.querySelector("#progress > div").style.backgroundColor = "#0f0";
	} else if (3 * count >= 2 * total) {
		// 66% - Reveal letter start counts.
		boardElement.style.setProperty("--total-count-visibility", "visible");
	} else if (3 * count >= total) {
		// 33% - Reveal letter counts.
		boardElement.style.setProperty("--start-count-visibility", "visible");
	}

	return true;
}
