import axios from "axios";
import express from "express";
import { createClient } from "redis";
import responseTime from "response-time";

const app = express();

const client = createClient({
    host: "127.0.0.1",
    port: 6379,
});

//Middleware
app.use(responseTime());

app.get("/services-with-redis", async (req, res) => {
    const reply = await client.get("services");

    if (reply) return res.json(JSON.parse(reply));

    const { data } = await axios.get("http://localhost:5295/api/v1/service/list");

    await client.set("services", JSON.stringify(data));

    return res.json(data);
});

app.get("/services-without-redis", async (req, res) => {
    const { data } = await axios.get("http://localhost:5295/api/v1/service/list");

    return res.json(data);
});

app.get("/services-with-redis/:id", async (req, res) => {
    const { id } = req.params;

    const reply = await client.get(id);

    if (reply) return res.json(JSON.parse(reply));

    const { data } = await axios.get("http://localhost:5295/api/v1/service/find/by-id/" + id);

    await client.set(id, JSON.stringify(data));

    return res.json(data);
});

app.get("/services-without-redis/:id", async (req, res) => {
    const { id } = req.params;

    const { data } = await axios.get("http://localhost:5295/api/v1/service/find/by-id/" + id);

    return res.json(data);
});

const main = async () => {
    await client.connect();
    app.listen(3000);
    console.log("Server is running on port 3000");
};

main();

// app.listen(3000, async () => {
//     await client.connect();
//     console.log("Server is running on port 3000");
// });

// package
// npm init -y

// install express
// npm i express

// install axios
// npm i axios

// time response :: time request
// npm i response-time

// Install redis
// npm i redis --> https://www.npmjs.com/package/redis
