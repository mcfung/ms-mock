import express from "express";
import path from "path";

export default ({app, basePath, config}) => {

    app.use(express.static(path.isAbsolute(config.path) ? config.path : path.join(basePath, config.path)));
}