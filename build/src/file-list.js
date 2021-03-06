"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const file_1 = __importDefault(require("./file"));
const humanize_1 = require("./humanize");
const chalk_1 = __importDefault(require("chalk"));
const os_1 = require("os");
const moment_1 = __importDefault(require("moment"));
const date_1 = require("./date");
const array_1 = require("./array");
const walk = (loc, files = new FileList()) => {
    const stats = fs_1.default.statSync(loc);
    if (stats.isDirectory()) {
        try {
            for (const l of fs_1.default.readdirSync(path_1.default.resolve(loc))) {
                walk(path_1.default.join(loc, l), files);
            }
        }
        catch (err) {
            console.error(chalk_1.default.red(err.message));
        }
    }
    else {
        files.push(new file_1.default(loc, stats));
    }
    return files;
};
class FileList extends Array {
    constructor() {
        super(...arguments);
        this.headers = {
            base(file) {
                return file.base;
            },
            type(file) {
                return file.type;
            },
            size(file) {
                return humanize_1.filesize(file.size);
            },
            date(file) {
                return file.date;
            }
        };
        this.sortingPresets = {
            latest(a, b) {
                return b.created.unix() - a.created.unix();
            },
            oldest(a, b) {
                return a.created.unix() - b.created.unix();
            },
            recent(a, b) {
                return b.modified.unix() - a.modified.unix();
            },
            smallest(a, b) {
                return a.size - b.size;
            },
            largest(a, b) {
                return b.size - a.size;
            }
        };
    }
    static create(loc, isRecursive = false) {
        if (isRecursive) {
            return walk(loc);
        }
        const fullpath = path_1.default.resolve(loc);
        const stats = fs_1.default.statSync(fullpath);
        if (stats.isDirectory()) {
            try {
                const contents = fs_1.default.readdirSync(fullpath);
                const files = new FileList();
                for (const p of contents) {
                    try {
                        const stats = fs_1.default.statSync(path_1.default.resolve(loc, p));
                        files.push(new file_1.default(path_1.default.join(loc, p), stats));
                    }
                    catch (err) {
                    }
                }
                return files;
            }
            catch (err) {
                console.error(chalk_1.default.red(err.message));
            }
        }
        return new file_1.default(loc, stats);
    }
    pick(...args) {
        this.headers = array_1.picker(...args);
        return this;
    }
    sort(compareFn, asc = "asc") {
        if (typeof compareFn === "string") {
            if (compareFn in this.sortingPresets) {
                this.sort(this.sortingPresets[compareFn]);
                return this;
            }
            if (compareFn === "latest") {
                this.sort((x, y) => {
                    return y.date - x.date;
                });
                return this;
            }
            if (asc === "asc") {
                this.sort((x, y) => {
                    return y[compareFn] - x[compareFn];
                });
            }
            else {
                this.sort((x, y) => {
                    return x[compareFn] - y[compareFn];
                });
            }
            return this;
        }
        if (typeof compareFn === "function") {
            return super.sort(compareFn);
        }
        return this;
    }
    clone(files) {
        const fileList = new FileList(...files);
        fileList.headers = this.headers;
        return fileList;
    }
    except(...args) {
        for (const a of args) {
            delete this.headers[a];
        }
        return this;
    }
    append(...args) {
        Object.assign(this.headers, array_1.picker(...args));
        return this;
    }
    map(callbackfn, thisArg) {
        const out = [];
        for (let i = 0; i < this.length; i++) {
            out.push(callbackfn(this[i], i, this));
        }
        return out;
    }
    toTable() {
        function format(x, value, file) {
            switch (x) {
                case "size":
                    if (file.isDirectory) {
                        return chalk_1.default.green('--');
                    }
                    return chalk_1.default.green(value);
                case "type":
                    if (value === "directory") {
                        return chalk_1.default.magenta.bold(value);
                    }
                    return chalk_1.default.magenta(value);
                case "name":
                case "location":
                case "base":
                    if (file.renamed) {
                        return [
                            chalk_1.default.strikethrough.yellow(value),
                            file.renamed
                        ].join(os_1.EOL);
                    }
                    if (file.isDeleted) {
                        return chalk_1.default.strikethrough.red(value);
                    }
                    return chalk_1.default.blueBright(value);
                default:
                    if (moment_1.default.isMoment(value)) {
                        return chalk_1.default.yellow(date_1.humanize(value));
                    }
                    return value;
            }
        }
        const headers = Object.keys(this.headers);
        const rows = this.map(file => {
            const row = [];
            for (const x of headers) {
                const callback = this.headers[x];
                row.push(format(x, callback(file), file));
            }
            return row;
        });
        return [headers, ...rows];
    }
    toJSON() {
        const headers = this.headers;
        return this.map(file => {
            const row = {};
            for (const x in headers) {
                const callback = headers[x];
                row[x] = callback(file);
            }
            return row;
        });
    }
}
exports.default = FileList;
