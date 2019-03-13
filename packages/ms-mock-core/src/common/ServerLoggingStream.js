// @flow
import {Duplex} from 'stream';

export default class ServerLoggingStream extends Duplex {

    constructor() {
        super({
            encoding: "utf8"
        });
        this.queue = [];
    }

    _write(chunk: any, encoding: string, cb: Function) {
        this.push(chunk);
        if (typeof cb === 'function') {
            cb();
        }
    }

    _read(size: number) {
    }

}