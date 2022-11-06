const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server, {
	cors: {
		origin: "*",
	},
});
const fetch = require("node-fetch");
require("dotenv").config();

const users = {};

const PORT = process.env.PORT || 8000;

io.on("connection", (socket) => {
	if (!users[socket.id]) {
		users[socket.id] = socket.id;
	}
	socket.emit("yourID", socket.id);

	io.sockets.emit("allUsers", users);

	socket.on("disconnect", () => {
		delete users[socket.id];
	});

	socket.on("callUser", (data) => {
		io.to(data.userToCall).emit("session", {
			signal: data.signalData,
			from: data.from,
		});
	});

	socket.on("acceptCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal);
	});
});

app.post("/webhook", (req, res) => {
	// const {
	// 	id = 9,
	// 	subject = "Test",
	// 	author = "ajanth",
	// 	description = "This is a test post",
	// 	technology = "JavaScript",
	// 	offer = 0,
	// 	requestId,
	// 	createdAt,
	// } = req.body.record;

	const DUMMY = {
		id: 9,
		subject: "Test",
		author: "ajanth",
		description: "This is a test post",
		technology: "JavaScript",
		offer: 0,
	};

	const message = {
		username: "de-duck",
		avatar_url: "https://i.imgur.com/4M34hi2.png",
		embeds: [
			{
				title: DUMMY.subject,
				description: DUMMY.description,
				color: 15258703,
				fields: [
					{
						name: "Inquiry by",
						value: DUMMY.author,
						inline: true,
					},
					{
						name: "Price",
						value: DUMMY.offer === 0 ? "FREE" : DUMMY.offer,
						inline: true,
					},
					{
						name: "Technology",
						value: DUMMY.technology,
						inline: true,
					},
					{
						name: "Request",
						value: `[Join](${process.env.FRONTEND_URL}/request/live/${DUMMY.id})`,
						inline: false,
					},
				],
				thumbnail: {
					url: "https://upload.wikimedia.org/wikipedia/commons/3/38/4-Nature-Wallpapers-2014-1_ukaavUI.jpg",
				},
				image: {
					url: "https://upload.wikimedia.org/wikipedia/commons/5/5a/A_picture_from_China_every_day_108.jpg",
				},
			},
		],
	};

	fetch(process.env.DISCORD_WEBHOOK_URL + "?wait=true", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(message),
	}).then((a) => a.json().then((response) => res.json(response)));
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
