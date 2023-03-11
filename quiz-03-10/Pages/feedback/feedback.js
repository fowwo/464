function submitFeedback(event) {
	event.preventDefault();
	
	const textarea = document.getElementById("message");
	let selectedRating;
	const emailInput = document.getElementById("email");

	// Validate message
	const message = textarea.value.trim();
	if (!message) {
		alert("Please enter a message in the feedback box.");
		return;
	}
	if (message.length > 256) {
		alert(`Your message is too long. (${message.length} characters)`);
		return;
	}

	// Validate rating
	for (const star of document.getElementsByName("rating")) {
		if (star.checked) {
			selectedRating = star;
			break;
		}
	}
	if (!selectedRating) {
		alert("Please rate the website from 1 to 5 stars.");
		return;
	}
	const rating = selectedRating.value;
	
	// Validate email
	const email = emailInput.value.trim();
	if (email && !email.match(/.+@.+/)) {
		alert("Your email address is invalid.");
		return;
	}

	alert(
		"Your feedback has been submitted.\n" +
		"\n" +
		`Message: ${message}\n` +
		(email ? `Email: ${email}\n` : "") +
		`Rating: ${rating} stars\n` +
		"\n" +
		"Thank you for the feedback!"
	);

	textarea.setAttribute("readonly", true);
	emailInput.setAttribute("readonly", true);
	document.getElementById("submit").disabled = true;
	for (const star of document.getElementsByName("rating")) star.disabled = true;
}
