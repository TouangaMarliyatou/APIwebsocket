const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const { exec } = require("child_process");

const app = express();
const PORT = 3000;
const GITHUB_SECRET = "Lysandre1."; // Replace with your GitHub secret

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Middleware to verify GitHub signature
function verifyGitHubSignature(req, res, next) {
    const signature = req.headers["x-hub-signature-256"];
    const payload = JSON.stringify(req.body);
    const hmac = crypto.createHmac("sha256", GITHUB_SECRET);
    const digest = `sha256=${hmac.update(payload).digest("hex")}`;

    if (signature === digest) {
        next();
    } else {
        res.status(401).send("Invalid signature");
    }
}

// Webhook endpoint
app.post("/webhook", verifyGitHubSignature, (req, res) => {
    const event = req.body;
    console.log("Received event:", JSON.stringify(event, null, 2));

    if (event.ref === "refs/heads/main") { // Replace with your branch name
        exec("git pull && npm install && npm run build", (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${error.message}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
        });
    }

    res.status(200).send("Event received");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
