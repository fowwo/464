const menuButton = document.getElementById("menu-button");

menuButton.addEventListener("click", (event) => {
	const nav = document.querySelector("nav");
	menuButton.classList.toggle("toggled");
	nav.style.visibility = nav.style.visibility === "hidden" ? "visible" : "hidden";
});

document.getElementById("theme-button").addEventListener("click", (event) => {
	if (document.documentElement.classList.contains("dark")) {
		document.documentElement.classList.replace("dark", "light");
	} else {
		document.documentElement.classList.replace("light", "dark");
	}
});
