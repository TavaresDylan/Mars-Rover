import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { Rover } from "./classes/Rover";
import { Direction } from "./enums/Direction";
import { Position } from "./classes/Position";
import { Coordinates } from "./classes/Coordinates";
import { Planete } from "./classes/Planete";
import { Interpreter } from "./interpreteurs/Interpreter";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
    },
});
const coordonneesRover = new Coordinates(0, 0);
const positionRover = new Position(coordonneesRover, Direction.Est);
const planete = new Planete(15, 15);
planete.generateObstacle(5);
const rover = new Rover(positionRover, planete, io);
const interpreter = new Interpreter();

io.on("connection", (socket: Socket) => {
    console.log("Rover connecté !");
    console.log(planete.obstacles);

    socket.on("ask-for-planete-size", () => {
        console.log("Demande de taille de la planète par le client ...");
        socket.emit("planete-size", {
            width: planete.width,
            height: planete.height,
        });
    });

    socket.on("ask-for-position", () => {
        console.log("Demande de position par le client ...");
        socket.emit("rover-position", {
            x: positionRover.coordinates.x,
            y: positionRover.coordinates.y,
        });

        console.log({
            x: positionRover.coordinates.x,
            y: positionRover.coordinates.y,
        });
    });

    socket.emit("rover-position", {
        x: positionRover.coordinates.x,
        y: positionRover.coordinates.y,
    });

    console.log({
        x: positionRover.coordinates.x,
        y: positionRover.coordinates.y,
    });

    socket.on("commande", (commandes: string) => {
        console.log("Commandes : " + commandes);

        const listeCommandes = commandes.split("");
        let messageResponse =
            "\nCoordonnées initiales : { X: " +
            rover.getCoordinates().x +
            ", Y: " +
            rover.getCoordinates().y +
            " } " +
            "Direction : " +
            rover.getDirection();
        let finalMessageResponse = interpreter.interpretCommands(
            listeCommandes,
            rover,
            messageResponse
        );
        socket.emit("response", finalMessageResponse);
    });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
    console.log(`Le server du Rover écoute le port : ${PORT}`);
});
