const alphabet = "abcdefghijklmnopqrstuvwxyz";
const words = await fetch("assets/resources/words_alpha.txt")
	.then(x => x.text())
	.then(x => new Set(x.trim().toLowerCase().replace(/[\r\n]+/g, "\n").split("\n").filter(x => x.length >= 4)));

const fragments = new Set(words);
for (const word of words) {
	for (let i = 1; i < word.length; i++) {
		const fragment = word.slice(0, i);
		if (!words.has(fragment)) fragments.add(fragment);
	}
}

export function parseBoard(string) {
	const board = string.toLowerCase()
		.replace(/[\r\n]+/g, "\n") // Remove carriage returns
		.replace(/[^\S\n]+/g, "")  // Remove non-newline whitespace
		.split(/[\n\/]/)           // Split on newline or slash
		.map(x => x.split(""))     // Split strings into letter arrays
		.filter(x => x.length);    // Remove empty rows

	// Validate
	const width = board[0].length;
	for (const row of board) {
		if (row.length !== width) throw Error("Each row must have the same number of characters.");
		for (const letter of row) {
			if (!(alphabet + ".").includes(letter)) throw Error(`'${letter}' is an invalid character.`);
		}
	}

	return board;
}

export function createBoard(board, totalCount, startCount) {
	const boardContainer = document.createElement("div");
	boardContainer.id = "board-container";
	boardContainer.style.setProperty("--start-count-visibility", "hidden");
	boardContainer.style.setProperty("--total-count-visibility", "hidden");
	
	// Create grid
	const boardElement = document.createElement("div");
	boardElement.id = "board";
	boardElement.style.aspectRatio = `${board[0].length} / ${board.length}`
	boardElement.style.gridTemplateRows = `repeat(${board.length}, 1fr)`;
	boardElement.style.gridTemplateColumns = `repeat(${board[0].length}, 1fr)`;
	for (let r = 0; r < board.length; r++) {
		for (let c = 0; c < board[0].length; c++) {
			const cell = document.createElement("div");
			boardElement.appendChild(cell);
			if (board[r][c] === ".") continue;

			const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			const letter = document.createElementNS("http://www.w3.org/2000/svg", "text");

			svg.setAttribute("viewBox", "0 0 1 1");

			letter.innerHTML = board[r][c].toUpperCase();
			letter.setAttribute("x", "50%");
			letter.setAttribute("y", "50%");
			letter.setAttribute("transform", "translate(0 -0.025)");
			letter.setAttribute("font-size", "0.75");
			letter.setAttribute("text-anchor", "middle");
			letter.setAttribute("dominant-baseline", "central");
			svg.appendChild(letter);

			const start = document.createElementNS("http://www.w3.org/2000/svg", "text");
			start.innerHTML = startCount?.[r][c] ? startCount[r][c] : "";
			start.style.visibility = "var(--start-count-visibility)";
			start.setAttribute("x", "5%");
			start.setAttribute("y", "95%");
			start.setAttribute("font-size", "0.25");
			start.setAttribute("color", "var(--accent-color)");
			svg.appendChild(start);

			const total = document.createElementNS("http://www.w3.org/2000/svg", "text");
			total.innerHTML = totalCount?.[r][c] ? totalCount[r][c] : "";
			total.style.visibility = "var(--total-count-visibility)";
			total.setAttribute("x", "95%");
			total.setAttribute("y", "95%");
			total.setAttribute("font-size", "0.25");
			total.setAttribute("text-anchor", "end");
			total.setAttribute("color", "var(--font-secondary)");
			svg.appendChild(total);
			if (!totalCount?.[r][c]) cell.style.opacity = 0.2;

			cell.appendChild(svg);
		}
	}

	// Create canvas
	const canvas = document.createElement("canvas");
	const cellSize = 100;
	canvas.setAttribute("width", `${board[0].length * cellSize}`);
	canvas.setAttribute("height", `${board.length * cellSize}`);
	
	boardContainer.appendChild(boardElement);
	boardContainer.appendChild(canvas);
	return boardContainer;
}

export function solve(board) {

	// Initialize search list with each letter.
	let list = [];
	for (let r = 0; r < board.length; r++) {
		for (let c = 0; c < board[0].length; c++) {
			if (alphabet.includes(board[r][c])) list.push([ board[r][c], [ `${r},${c}` ] ]);
		}
	}

	// Perform breadth-first search to find all words.
	const foundWords = {};
	while (list.length > 0) {
		const next = [];
		for (const [ word, path ] of list) {
			const [ r, c ] = path.at(-1).split(",").map(x => parseInt(x));
			const surrPaths = getSurroundingCoordinates(r, c, board);
			for (const [ pr, pc ] of surrPaths) {
				if (!path.includes(`${pr},${pc}`)) {
					const newWord = word + board[pr][pc];
					if (!fragments.has(newWord)) continue;

					const newPath = path.slice();
					newPath.push(`${pr},${pc}`);
					next.push([ newWord, newPath ]);
					if (words.has(newWord) && !(newWord in foundWords)) {
						foundWords[newWord] = newPath;
					}
				}
			}
		}
		list = next;
	}

	return foundWords;
}

export function findWordPaths(word, board) {
	word = word.toLowerCase();

	// Perform breadth-first search to find all word paths.
	let list = findCharacterCoordinates(word[0], board).map(x => [x]);
	for (const letter of word.slice(1)) {
		const next = [];
		for (const path of list) {
			next.push(...extendPath(path, letter, board));
		}
		list = next;
	}

	return list;
}

export function findCharacterCoordinates(letter, board) {
	letter = letter.toLowerCase();

	const list = [];
	for (let r = 0; r < board.length; r++) {
		for (let c = 0; c < board[0].length; c++) {
			if (board[r][c] === letter) list.push([ r, c ]);
		}
	}

	return list;
}

export function extendPath(path, letter, board) {
	letter = letter.toLowerCase();
	if (path.length === 0) return findCharacterCoordinates(letter, board).map(x => [x]);

	const paths = [];
	const posSet = new Set(path.map(x => x.join(",")));
	const [ r, c ] = path.at(-1);
	const surroundingCells = getSurroundingCoordinates(r, c, board);
	for (const [ pr, pc ] of surroundingCells) {
		if (board[pr][pc] === letter && !posSet.has(`${pr},${pc}`)) {
			const newPath = path.slice();
			newPath.push([ pr, pc ]);
			paths.push(newPath);
		}
	}

	return paths;
}

export function pathString(path, board) {
	return path.map(([ r, c ]) => board[r][c]).join("");
}

function getSurroundingCoordinates(r, c, board) {
	const list = [];
	for (let i = -1; i <= 1; i++) {
		for (let j = -1; j <= 1; j++) {
			if (!i && !j) continue;
			const [ pr, pc ] = [ r + i, c + j ];
			if (pr >= 0 && pr < board.length && pc >= 0 && pc < board[0].length && alphabet.includes(board[pr][pc])) {
				list.push([ pr, pc ]);
			}
		}
	}
	return list;
}

export function clearPath(context) {
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

export function drawPath(context, path) {
	const toCanvasCoordinates = (r, c) => [ c * 100 + 50, r * 100 + 50 ];
	const [ r, c ] = path[0];
	const [ x, y ] = toCanvasCoordinates(r, c);
	context.beginPath();
	context.lineWidth = 30;
	context.lineCap = "round";
	context.lineJoin = "round";
	context.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color-transparent-2');
	context.moveTo(x, y);
	for (const [ r, c ] of path) {
		const [ x, y ] = toCanvasCoordinates(r, c);
		context.lineTo(x, y);
	}
	context.stroke();
}
