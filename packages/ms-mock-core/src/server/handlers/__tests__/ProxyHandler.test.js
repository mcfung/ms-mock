import ProxyHandler from '../ProxyHandler';
import buildApp from "../../app";
import proxy from "express-http-proxy";

jest.mock('express-http-proxy');

describe("ProxyHandler", () => {

    it('should pass the options to the express-http-proxy package', () => {

        const app = buildApp([]);
        const expectedOptions = {
            "parseReqBody": true
        };
        proxy.mockReturnValue((req, res, next) => next());
        const expectedHost = "http://www.example.com";
        ProxyHandler({
            app,
            config: {
                "path": "/",
                "host": expectedHost,
                "proxyOptions": expectedOptions
            }
        });

        expect(proxy).toBeCalledWith(expectedHost, expect.objectContaining(expectedOptions));
    });

    it('should add userResHeaderDecorator if cors is set to true', () => {

        const app = buildApp([]);
        proxy.mockReturnValue((req, res, next) => next());
        const expectedHost = "http://www.example.com";
        ProxyHandler({
            app,
            config: {
                "path": "/",
                "host": expectedHost,
                "cors": true
            }
        });

        expect(proxy).toBeCalledWith(expectedHost, expect.objectContaining({
            userResHeaderDecorator: expect.any(Function)
        }));
    });

    it('should not add userResHeaderDecorator if cors is set to false', () => {

        const app = buildApp([]);
        proxy.mockReturnValue((req, res, next) => next());
        const expectedHost = "http://www.example.com";
        ProxyHandler({
            app,
            config: {
                "path": "/",
                "host": expectedHost,
                "cors": false
            }
        });

        expect(proxy).toBeCalledWith(expectedHost, expect.not.objectContaining({
            userResHeaderDecorator: expect.any(Function)
        }));
    });
});