require('dotenv').config({ path: `./.env.local`, overwrite: true })
require('dotenv').config()

// create the http server
import express from "express";
import http from "http";
const app = express();
const httpServer = http.createServer(app);

import bodyParser from "body-parser";
import cron from "node-cron";
import rateLimit from 'express-rate-limit';

import cors from 'cors';
let corsOptions = {
    origin: process.env.NODE_ENV == "production" ? `https://${process.env.FRONTEND_DOMAIN}` : "http://127.0.0.1:3000",
    optionsSuccessStatus: 200,
    credentials: true
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(require('cookie-parser')());
app.use(require('express-device').capture());

app.use(require('./libs/morgan'))

import { getFiles, loadFile, getRouteName } from './libs/files';

const { PrismaClient } = require('database');
const prisma = new PrismaClient();

// import types
import type Task from "@/interfaces/Task";
import type Server from "@/interfaces/Server";
import type Route from "@/interfaces/Route";
import type AuthManager from '@/interfaces/managers/AuthManager';
import type NotificationManager from '@/interfaces/managers/NotificationManager';

(async () => {
    console.log("\x1b[32mstart\x1b[0m Express Server")
    console.log("\x1b[32mstart\x1b[0m Prisma Client")
    await prisma.$connect();

    let authManager: AuthManager = require("./managers/Auth")(prisma);
    let notificationManager: NotificationManager = require("./managers/Notification")(prisma);

    // create the server
    const server: Server = {
        database: prisma,
        environment: process.env.NODE_ENV == "production" ? "production" : "development",
        authManager: authManager,
        notificationManager: notificationManager,
    }
    
    // load routes
    console.log();
    console.log("\x1b[36mi" + "\x1b[0m Loading routes");

    var routePaths = getFiles(`${__dirname}/routes`, [".js", ".ts"]);

    routePaths.sort((a, b) => {
        let aSplit = a.split('/');
        let bSplit = b.split('/');
        let aLength = aSplit.length;
        let bLength = bSplit.length;
        let minLength = Math.min(aLength, bLength);
        for(let i = 0; i < minLength; i++) {
            if(aSplit[i].startsWith(':') && !bSplit[i].startsWith(':')) return 1;
            if(!aSplit[i].startsWith(':') && bSplit[i].startsWith(':')) return -1;
        }
        return aLength - bLength;
    })

    for(var i = 0; i < routePaths.length; i++) {
        var routePath = routePaths[i];
        // @ts-ignore
        let route: Route = loadFile<Route>(`${routePath}`, server);
        let routeName = getRouteName(routePath.replace(`${__dirname}/routes`, ''));
        let router = route.router();
        if (route.rateLimit){
            var rateLimiter = rateLimit({
                windowMs: route.rateLimit.timePeriod*1000,
                max: route.rateLimit.max,
                message: "Too many requests from this IP, please try again later"
            })
            app.use(routeName, rateLimiter, router)
        } else {
            var rateLimiter = rateLimit({
                windowMs: 60*1000,
                max: 1000,
                message: "Too many requests from this IP, please try again later"
            })
            app.use(routeName, rateLimiter, router);
        }
        console.log("\x1b[2m ○ \x1b[0m\x1b[37m" + (routeName == '/' ? routeName : routeName.slice(0, -1)) + (routeName == '/' ? " \x1b[3m\x1b[35m(index)" : "") + "\x1b[0m")
        for(var j = 0; j < router.stack.length; j++) {
            var stack = router.stack[j];
            
            //let _routePath = stack.route.path == '/' ? routeName : `${routeName}${stack.route.path.slice(1)}/`
            let routeMethods = stack.route.methods
            let routeMethod = routeMethods._all ? 'ALL' : routeMethods.get ? '\x1b[32mGET' : routeMethods.post ? '\x1b[34mPOST' : routeMethods.put ? '\x1b[33mPUT' : routeMethods.delete ? '\x1b[31mDELETE' : routeMethods.options ? 'OPTIONS' : 'UNKNOWN';
            
            console.log("\x1b[2m"+(j == router.stack.length-1 ? " └─ " : " ├─ ") + `\x1b[0m${routeMethod}\x1b[0m - ${stack.route.path}` + (stack.route.path == '/' ? " \x1b[3m\x1b[35m(index)" : "") + "\x1b[0m");
        }
        console.log();
    }

    // load the tasks
    console.log("\x1b[36mi" + "\x1b[0m Loading tasks");
    var taskPaths = getFiles(`${__dirname}/tasks`, [".ts", ".js"]);
    for(var i = 0; i < taskPaths.length; i++) {
        var taskPath = taskPaths[i];
        // @ts-ignore
        let task: Task = loadFile<Task>(`${taskPath}`, server);
        if(task.enabled) cron.schedule(task.cron, async () => await task.run());
        console.log("\x1b[2m"+(i == taskPaths.length-1 ? "└─ " : "├─ ") + "\x1b[0m" +task.name + (task.enabled ? ` \x1b[32m(${task.cron})` : " \x1b[31m(disabled)\x1b[0m"));
    }
    httpServer.listen(process.env.PORT || 3000, () => {
        console.log();
        console.log("\x1b[32m√"+ "\x1b[0m" +" Express server is running on \x1b[36m" + (process.env.NODE_ENV == "development" ? "http://127.0.0.1:"+(process.env.PORT || 3000) : process.env.DOMAIN)+"\x1b[0m");
    });
})();