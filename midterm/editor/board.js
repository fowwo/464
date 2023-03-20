const alphabet = "abcdefghijklmnopqrstuvwxyz";

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
