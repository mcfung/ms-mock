import {addRoute} from "../routes";

export default ({app, customFs, basePath, config}) => {

    addRoute(config, app, customFs, basePath);
}