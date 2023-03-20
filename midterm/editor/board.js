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

// Manual puzzle creation form
document.getElementById("puzzle-input").onsubmit = (event) => {
	event.preventDefault();

	let board;
	const errorMessage = event.target.querySelector("p");

	try {
		board = parseBoard(event.target.querySelector("textarea").value);
		displayBoard(board);
		errorMessage.style.display = "none";
	} catch (error) {
		errorMessage.innerText = error;
		errorMessage.style.display = "";
		return;
	}

	const foundWords = solve(board);
	document.getElementById("word-count").innerText = `${foundWords.length} word${foundWords.length === 1 ? "" : "s"}`;
	
	const wordBox = document.getElementById("words");
	wordBox.innerHTML = "";
	let length, ul;
	for (const word of foundWords) {
		if (word.length !== length) {
			length = word.length;
			const h3 = document.createElement("h3");
			h3.innerText = `${length} letter${length === 1 ? "" : "s"}`;
			wordBox.appendChild(h3);
			ul = document.createElement("ul");
			wordBox.appendChild(ul);
		}
		const li = document.createElement("li");
		li.innerText = word;
		ul.appendChild(li);
	}

};

function solve(board) {
	const foundWords = new Set();

	// Initialize search list with each letter.
	let list = [];
	for (let r = 0; r < board.length; r++) {
		for (let c = 0; c < board[0].length; c++) {
			if (alphabet.includes(board[r][c])) list.push([ board[r][c], [ `${r},${c}` ] ]);
		}
	}

	// Perform breadth-first search to find all words.
	while (list.length > 0) {
		const next = [];
		for (const [ word, path ] of list) {
			const [ r, c ] = path.at(-1).split(",").map(x => parseInt(x));
			for (let i = -1; i <= 1; i++) {
				for (let j = -1; j <= 1; j++) {
					if (!i && !j) continue;
					const [ pr, pc ] = [ r + i, c + j ];
					if (pr >= 0 && pr < board.length && pc >= 0 && pc < board[0].length && alphabet.includes(board[pr][pc]) && !path.includes(`${pr},${pc}`)) {
						const newWord = word + board[pr][pc];
						if (!fragments.has(newWord)) continue;

						const newPath = path.slice();
						newPath.push(`${pr},${pc}`);
						next.push([ newWord, newPath ]);
						if (words.has(newWord)) {
							foundWords.add(newWord);
						}
					}
				}
			}
		}
		list = next;
	}

	// Sort by word length and then by alphabetic order.
	return Array.from(foundWords).sort((a, b) => {
		if (a.length < b.length) return -1;
		else if (a.length > b.length) return 1;
		else if (a < b) return -1;
		else if (a > b) return 1;
		return 0;
	});
}

function parseBoard(string) {
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

function displayBoard(board) {
	const boardElement = document.getElementById("board");
	boardElement.innerHTML = "";
	boardElement.style.aspectRatio = `${board[0].length} / ${board.length}`
	boardElement.style.gridTemplateRows = `repeat(${board.length}, 1fr)`;
	boardElement.style.gridTemplateColumns = `repeat(${board[0].length}, 1fr)`;
	for (const row of board) {
		for (const letter of row) {
			const td = document.createElement("div");
			boardElement.appendChild(td);
			if (!alphabet.includes(letter)) continue;

			const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			const text = document.createElementNS("http://www.w3.org/2000/svg", "text");

			svg.setAttribute("viewBox", "0 0 1 1");
			svg.appendChild(text);

			text.innerHTML = letter.toUpperCase();
			text.setAttribute("x", "50%");
			text.setAttribute("y", "50%");
			text.setAttribute("text-anchor", "middle");
			text.setAttribute("dominant-baseline", "central");

			td.appendChild(svg);
		}
	}
}
