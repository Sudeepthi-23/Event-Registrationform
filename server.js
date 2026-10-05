const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = 3000;

/*
 * Security Headers
 */
app.use(helmet());

/*
 * Request Body Size Limit
 *
 * Prevents excessively large JSON requests.
 */
app.use(
    express.json({
        limit: "10kb"
    })
);

/*
 * Rate Limiting
 *
 * Maximum 20 registration attempts
 * from one client within 15 minutes.
 */
const registrationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    max: 20,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        message:
            "Too many registration attempts. Please try again later."
    }
});

/*
 * Serve only frontend files
 * from the public directory.
 */
app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

/*
 * Allowed Event Values
 */
const allowedEvents = [
    "DevOps Workshop",
    "AI Seminar",
    "Hackathon",
    "Technical Symposium"
];

/*
 * Allowed Gender Values
 */
const allowedGenders = [
    "Male",
    "Female",
    "Other"
];

/*
 * Input Validation Function
 */
function validateRegistration(data) {

    /*
     * Check whether all required fields
     * exist and are strings.
     */
    if (
        !data ||
        typeof data.name !== "string" ||
        typeof data.email !== "string" ||
        typeof data.phone !== "string" ||
        typeof data.event !== "string" ||
        typeof data.gender !== "string"
    ) {
        return "Invalid registration data.";
    }

    /*
     * Remove unnecessary spaces.
     */
    const name = data.name.trim();
    const email = data.email.trim();
    const phone = data.phone.trim();
    const selectedEvent = data.event.trim();
    const gender = data.gender.trim();

    /*
     * Name Validation
     */
    if (name.length < 2 || name.length > 50) {
        return "Name must contain 2 to 50 characters.";
    }

    /*
     * Only allow letters, spaces,
     * periods, apostrophes and hyphens.
     */
    const namePattern = /^[a-zA-Z\s.'-]+$/;

    if (!namePattern.test(name)) {
        return "Name contains invalid characters.";
    }

    /*
     * Email Validation
     */
    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
        !emailPattern.test(email) ||
        email.length > 100
    ) {
        return "Enter a valid email address.";
    }

    /*
     * Phone Number Validation
     *
     * Exactly 10 digits.
     */
    if (!/^\d{10}$/.test(phone)) {
        return "Phone number must contain exactly 10 digits.";
    }

    /*
     * Event Allow-list Validation
     */
    if (!allowedEvents.includes(selectedEvent)) {
        return "Invalid event selected.";
    }

    /*
     * Gender Allow-list Validation
     */
    if (!allowedGenders.includes(gender)) {
        return "Invalid gender selected.";
    }

    /*
     * Everything is valid.
     */
    return null;
}

/*
 * Registration API
 */
app.post(
    "/register",
    registrationLimiter,
    function (req, res) {

        /*
         * Perform server-side validation.
         */
        const validationError =
            validateRegistration(req.body);

        /*
         * Reject invalid data.
         */
        if (validationError) {

            return res.status(400).json({
                message: validationError
            });
        }

        /*
         * Create registration object.
         */
        const registration = {

            name: req.body.name.trim(),

            email:
                req.body.email
                    .trim()
                    .toLowerCase(),

            phone: req.body.phone.trim(),

            event: req.body.event.trim(),

            gender: req.body.gender.trim(),

            registeredAt:
                new Date().toISOString()
        };

        /*
         * Location of the text-file database.
         *
         * This file is NOT inside public/,
         * so users cannot directly access it
         * through the browser.
         */
        const databasePath = path.join(
            __dirname,
            "data",
            "registrations.txt"
        );

        /*
         * Convert registration object
         * into one JSON line.
         */
        const record =
            JSON.stringify(registration) + "\n";

        /*
         * Append registration to the file.
         */
        fs.appendFile(
            databasePath,
            record,
            {
                encoding: "utf8",
                flag: "a"
            },
            function (error) {

                if (error) {

                    console.error(
                        "Database write error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Registration could not be completed."
                    });
                }

                /*
                 * Successful registration.
                 */
                return res.status(201).json({
                    message:
                        "Registration completed successfully."
                });
            }
        );
    }
);

/*
 * Handle invalid URLs.
 */
app.use(function (req, res) {

    res.status(404).json({
        message: "Resource not found."
    });
});

/*
 * Start Server
 */
app.listen(
    PORT,
    function () {

        console.log(
            `Server running at http://localhost:${PORT}`
        );
    }
);
