import chai, {should} from "chai";
import chaiHttp from "chai-http";
import path from 'path';
import buildApp from "../app";

describe("buildApp", () => {
    let app;

    beforeAll(() => {

        chai.use(chaiHttp);
        should();
    });

    beforeEach(() => {
        app = buildApp([
            {
                type: 'static',
                path: "./"
            },
            {
                type: 'static',
                path: path.join(__dirname, "absolute")
            },
            {
                type: 'proxy',
                path: "/proxied",
                host: "https://example.com"
            },
            {
                type: 'combinations',
                method: 'get',
                path: "/test",
                combinations: [
                    {
                        cors: false,
                        headers: [{
                            name: "X-Req-Header-1",
                            matchRule: "exact",
                            value: "V1"
                        }],
                        query: [{
                            name: "param1",
                            matchRule: "exact",
                            value: "value1"
                        }],
                        response: {
                            headers: [{
                                name: "X-Cust-Header",
                                value: "Custom Value"
                            }],
                            content: {
                                message: "test"
                            },
                            statusCode: 200
                        }
                    }
                ]
            }
        ], undefined, undefined, __dirname);
    });

    it('should return 200 and cors content if both header and query match', (done) => {

        chai.request(app)
            .get('/test?param1=value1')
            .set("X-Req-Header-1", "V1")
            .end((err, res) => {
                expect(res.statusCode).toBe(200);
                expect(res.header["x-cust-header"]).toBe("Custom Value");
                expect(res.header["access-control-allow-origin"]).toBeUndefined();
                expect(res.header["access-control-allow-headers"]).toBeUndefined();
                expect(res.body).toEqual({message: "test"});
                done();
            })
    });

    it('should return 404 if header mismatch', (done) => {

        chai.request(app)
            .get('/test?param1=value1')
            .end((err, res) => {
                expect(res.statusCode).toBe(404);
                done();
            })
    });

    it('should return 404 if one of the headers mismatch', (done) => {

        app = buildApp([{
            type: 'combinations',
            method: 'get',
            path: "/test",
            combinations: [
                {
                    cors: false,
                    headers: [{
                        name: "X-Req-Header-1",
                        matchRule: "exact",
                        value: "V1"
                    }, {
                        name: "X-Req-Header-2",
                        matchRule: "exact",
                        value: "V2"
                    }],
                    response: {
                        headers: [{
                            name: "X-Cust-Header",
                            value: "Custom Value"
                        }],
                        content: {
                            message: "test"
                        },
                        statusCode: 200
                    }
                }
            ]
        }]);
        chai.request(app)
            .get('/test')
            .set("X-Req-Header-2", "V2")
            .end((err, res) => {
                expect(res.statusCode).toBe(404);
                done();
            })
    });

    it('should return 404 if query mismatch', (done) => {

        chai.request(app)
            .get('/test')
            .set("X-Req-Header-1", "V1")
            .end((err, res) => {
                expect(res.statusCode).toBe(404);
                done();
            })
    });

    it('should return 404 if one of the query mismatch', (done) => {

        app = buildApp([{
            type: 'combinations',
            method: 'get',
            path: "/test",
            combinations: [
                {
                    cors: false,
                    query: [{
                        name: "param1",
                        matchRule: "exact",
                        value: "value1"
                    }, {
                        name: "param2",
                        matchRule: "exact",
                        value: "value2"
                    }],
                    response: {
                        headers: [{
                            name: "X-Cust-Header",
                            value: "Custom Value"
                        }],
                        content: {
                            message: "test"
                        },
                        statusCode: 200
                    }
                }
            ]
        }]);
        chai.request(app)
            .get('/test?param2=value2')
            .end((err, res) => {
                expect(res.statusCode).toBe(404);
                done();
            })
    });

    it('should throw error if unsupport type is detected', () => {
        expect(() => {
            buildApp([
                {
                    type: "unsupported"
                }
            ])
        }).toThrow();
    });

    it('should return string content if content is provided', (done) => {
        const app = buildApp([{
            type: 'combinations',
            method: 'get',
            path: "/test",
            combinations: [
                {
                    response: {
                        headers: [{
                            name: "Content-Type",
                            value: "text/plain"
                        }],
                        content: "test",
                        statusCode: 200
                    }
                }
            ]
        }]);
        chai.request(app)
            .get('/test')
            .end((err, res) => {
                expect(res.body).toEqual({});
                expect(res.text).toBe("test");
                expect(res.header["access-control-allow-origin"]).toBeUndefined();
                expect(res.header["access-control-allow-headers"]).toBeUndefined();
                done();
            })
    });

    it('should return cors header is cors is set to true', (done) => {
        const app = buildApp([{
            type: 'combinations',
            method: 'get',
            path: "/test",
            combinations: [
                {
                    cors: true,
                    response: {
                        headers: [{
                            name: "Content-Type",
                            value: "text/plain"
                        }],
                        content: "test",
                        statusCode: 200
                    }
                }
            ]
        }]);
        chai.request(app)
            .get('/test')
            .end((err, res) => {
                expect(res.header["access-control-allow-origin"]).toBe("*");
                expect(res.header["access-control-allow-headers"]).toBe("*");
                done();
            });
    });

    it('should return file given relative path', (done) => {
        const app = buildApp([{
            type: 'combinations',
            method: 'get',
            path: "/test",
            combinations: [
                {
                    cors: true,
                    response: {
                        headers: [{
                            name: "Content-Type",
                            value: "text/plain"
                        }],
                        fileContent: true,
                        filePath: "./app.test.js",
                        statusCode: 200
                    }
                }
            ]
        }], undefined, undefined, __dirname);
        chai.request(app)
            .get('/test')
            .end((err, res) => {
                expect(res.statusCode).toBe(200);
                done();
            });
    });

    it('should return file given absolute path', (done) => {
        const app = buildApp([{
            type: 'combinations',
            method: 'get',
            path: "/test",
            combinations: [
                {
                    cors: true,
                    response: {
                        headers: [{
                            name: "Content-Type",
                            value: "text/plain"
                        }],
                        fileContent: true,
                        filePath: path.join(__dirname, "./app.test.js"),
                        statusCode: 200
                    }
                }
            ]
        }], undefined, undefined, __dirname);
        chai.request(app)
            .get('/test')
            .end((err, res) => {
                expect(res.statusCode).toBe(200);
                done();
            });
    });

    it('should return 500 if file not found', (done) => {

        const app = buildApp([{
            type: 'combinations',
            method: 'get',
            path: "/test",
            combinations: [
                {
                    cors: true,
                    response: {
                        headers: [{
                            name: "Content-Type",
                            value: "text/plain"
                        }],
                        fileContent: true,
                        filePath: "./test.js",
                        statusCode: 200
                    }
                }
            ]
        }], undefined, undefined, __dirname);
        chai.request(app)
            .get('/test')
            .end((err, res) => {
                expect(res.statusCode).toBe(500);
                done();
            });
    });

    it('should serve static file', (done) => {
        chai.request(app)
            .get('/absolute-file.txt')
            .end((err, res) => {
                expect(res.statusCode).toBe(200);
                expect(res.text).toBe("absolute");
                done();
            });
    });
});