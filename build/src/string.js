"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const os_1 = require("os");
const humanize_1 = require("./humanize");
function string() {
    Object.defineProperties(Number.prototype, {
        filesize: {
            get() {
                return humanize_1.filesize(this);
            }
        }
    });
    Object.defineProperties(String.prototype, {
        filesize: {
            get() {
                return humanize_1.filesize(parseInt(this));
            }
        },
        uppercase: {
            get() {
                return this.toUpperCase();
            }
        },
        lowercase: {
            get() {
                return this.toLowerCase();
            }
        },
        camelcase: {
            get() {
                return lodash_1.default.camelCase(this);
            }
        },
        upperfirst: {
            get() {
                return lodash_1.default.upperFirst(this);
            }
        },
        capitalize: {
            get() {
                return lodash_1.default.capitalize(this);
            }
        },
        kebabcase: {
            get() {
                return lodash_1.default.kebabCase(this);
            }
        },
        snakecase: {
            get() {
                return lodash_1.default.snakeCase(this);
            }
        },
        limit: {
            value(length, separator) {
                return lodash_1.default.truncate(this, {
                    length, separator
                });
            }
        },
        words: {
            get() {
                return lodash_1.default.words(this);
            }
        },
        lines: {
            get() {
                return this.split(os_1.EOL);
            }
        }
    });
}
exports.default = string;
;
