const alphabet = "abcdefghijklmnopqrstuvwxyz";

let board = null;

// Manual puzzle creation form
document.getElementById("puzzle-input").onsubmit = (event) => {
	event.preventDefault();

	const errorMessage = event.target.querySelector("p");

	try {
		board = parseBoard(event.target.querySelector("textarea").value);
	} catch (error) {
		errorMessage.innerText = error;
		errorMessage.style.display = "";
		return;
	}
	
	errorMessage.style.display = "none";
	displayBoard(board);
};

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
