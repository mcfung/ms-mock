import ServerLoggingStream from "../ServerLoggingStream";

describe("ServerLoggingStream", () => {

    it('should read when write data', (done) => {

        const stream = new ServerLoggingStream();
        stream.on('data', (chunk) => {
            expect(chunk).toBe('test');
            done();
        });
        stream.write('test');
    });
});