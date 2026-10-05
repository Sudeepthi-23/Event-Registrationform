const form = document.getElementById("registrationForm");
const message = document.getElementById("message");

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(form);

    const data = {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        event: formData.get("event"),
        gender: formData.get("gender")
    };

    try {
        const response = await fetch("/register", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        });

        const result = await response.json();

        message.textContent = result.message;

        if (response.ok) {
            message.style.color = "green";
            form.reset();
        } else {
            message.style.color = "red";
        }

    } catch (error) {

        console.error(error);

        message.textContent =
            "Unable to connect to the server. Please try again.";

        message.style.color = "red";
    }
});
