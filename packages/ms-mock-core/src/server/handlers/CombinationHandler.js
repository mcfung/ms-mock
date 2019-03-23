import {addRoute} from "../routes";

export default ({app, customFs, basePath, config, pluginMatchers}) => {

    addRoute(config, app, customFs, basePath, pluginMatchers);
}