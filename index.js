import "dotenv/config";
import express from "express";
import { serve } from "inngest/express";
import { inngest } from "./inngest/client.js";
import { functions } from "./inngest/functions/index.js";

const app = express();

app.use(express.json());
app.use("/api/inngest", serve({ client: inngest, functions }));

const port = 3000;

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log(`OpenAPI key is here: ${process.env.OPENAI_API_KEY}`);
    
});