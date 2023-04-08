import { parseBoard, displayBoard, solve } from "../assets/scripts/board.js";

// Manual puzzle creation form
document.getElementById("puzzle-input").onsubmit = (event) => {
	event.preventDefault();

	let board;
	const errorMessage = event.target.querySelector("p");

	// Parse board
	try {
		board = parseBoard(event.target.querySelector("textarea").value);
		errorMessage.style.display = "none";
	} catch (error) {
		errorMessage.innerText = error;
		errorMessage.style.display = "";
		return;
	}

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
	displayBoard(board, totalCount, startCount);

	document.getElementById("word-count").innerText = `${solution.length} word${solution.length === 1 ? "" : "s"}`;
	
	const wordBox = document.getElementById("words");
	wordBox.innerHTML = "";
	let length, ul;
	for (const [ word, path ] of solution) {
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
