const fs = require('fs');
const request = require('request-promise');
const errorMessage = require('./customErrorMessage');
const {ParametersParseError} = require('./error');

class Nudb {
    constructor() {
        this.API = 'http://localhost:5800/nudb/';
        this.db = 'test';
    }

    /**
     * Connect to NUDB.
     * @param {String} host DB host
     * @param {Number} port DB port
     * @param {String} db DB name
     */
    connect(host, port, db) {
        this.API = `http://${host}:${port}/nudb`;
        this.db = db;
    }

    /**
     * Get DB info.
     * @param {String} db DB name
     * @param {Number} timeout timeout (ms)
     */
    async getDBInfo(db, timeout=20000) {
        if(!db) {
            throw new ParametersParseError(errorMessage.MISSING_DB_PARAMETER);
        }

        let uri = `${this.API}/getDBInfo`;
        let opts = {
            uri,
            timeout,
            method: 'GET',
            qs: {
                db,
                out: 'json'
            },
            json: true
        };
        return this.execute(opts);
    }

    /**
     * Search
     * @param {Object} query Query object.
     * @param {Number} timeout timeout (ms)
     */
    async search(query, timeout=20000) {
        if(!query) {
            throw new ParametersParseError(errorMessage.MISSING_QUERY_PARAMETER);
        }
        let uri = `${this.API}/query`;
        let opts = {
            uri,
            timeout,
            method: 'GET',
            qs: query
        };

        // Automatically parses the JSON string in the response
        if(opts.qs.out === 'json') {
            opts.json = true;
        }

        return this.execute(opts);
    }

    /**
     * Get data by rid.
     * @param {String} rid Record ID.
     * @param {Number} timeout timeout (ms)
     */
    async rget(rid, timeout=20000) {
        if(!rid) {
            throw new ParametersParseError(errorMessage.MISSING_ID_PARAMETER);
        }

        let uri = `${this.API}/rget`;
        let opts = {
            uri,
            timeout,
            method: 'GET',
            qs: {
                db: this.db,
                rid: rid,
                out: 'json'
            },
            json: true
        };
        return this.execute(opts);
    }

    /**
     * Insert data to DB.
     * @param {Object} data Data
     * @param {String} format Data format. (json|text)
     * @param {String} recBeg Record begin pattern. If format is 'text', must have recBeg.
     * @param {Number} timeout timeout (ms)
     */
    async rput(data, format, recBeg=null, timeout=20000) {
        if(!data) {
            throw new ParametersParseError(errorMessage.MISSING_DATA_PARAMETER);
        }
        if(format !== 'text' && format !== 'json') {
            throw new ParametersParseError(errorMessage.WRONG_FORMAT_PARAMETER);
        }
        if(format === 'text' && typeof data !== 'string') {
            throw new ParametersParseError(errorMessage.WRONG_FORMAT);
        }
        if(format === 'text' && !recBeg) {
            throw new ParametersParseError(errorMessage.MISSING_RECBEG_PARAMETER);
        }
        if(format === 'json') {
            try {
                if(typeof data === 'object') {
                    data = JSON.stringify(data);
                } else {
                    JSON.parse(data);
                }
            } catch(err) {
                throw new ParametersParseError(`${errorMessage.WRONG_FORMAT}, ${err}`);
            }
        }

        let uri = `${this.API}/rput`;
        let qs = {
            data,
            format,
            db: this.db
        };
            
        if(format === 'text') {
            qs.recbeg = recBeg;
        }

        let opts = {
            uri,
            timeout,
            qs,
            method: 'POST',
            json: true
        };
        return this.execute(opts);
    }

    /**
     * Insert data from file.
     * @param {String} file File path.
     * @param {String} format Data format. (json|text)
     * @param {String} recBeg Record begin pattern. If format is 'text', must have recBeg.
     * @param {Number} timeout timeout (ms)
     */
    async fput(file, format, recBeg=null, timeout=120000) {
        if(!file) {
            throw new ParametersParseError(errorMessage.MISSING_FILE_PARAMETER);
        }
        if(!fs.existsSync(file)) {
            throw new ParametersParseError(errorMessage.FILE_NOT_EXISTS);
        }
        if(format !== 'text' && format !== 'json') {
            throw new ParametersParseError(errorMessage.WRONG_FORMAT_PARAMETER);
        }
        if(format === 'text' && !recBeg) {
            throw new ParametersParseError(errorMessage.MISSING_RECBEG_PARAMETER);
        }
        
        let uri = `${this.API}/fput`;
        let qs = {
            format,
            db: this.db,
            out: 'json'
        };
            
        if(format === 'text') {
            qs.recbeg = recBeg;
        }

        let opts = {
            uri,
            timeout,
            qs,
            method: 'POST',
            formData: {
                file: fs.createReadStream(file)
            },
            json: true
        };
        return this.execute(opts);
    }

    /**
     * Delete record by rid.
     * @param {String} rid Record ID.
     * @param {Number} timeout timeout (ms)
     */
    async rdel(rid, timeout=20000) {
        if(!rid) {
            throw new ParametersParseError(errorMessage.MISSING_ID_PARAMETER);
        }

        let uri = `${this.API}/rdel`;
        let opts = {
            uri,
            timeout,
            method: 'POST',
            qs: {
                db: this.db,
                rid: rid,
                out: 'json'
            },
            json: true
        };
        return this.execute(opts);
    }

    /**
     * Update record.
     * @param {String} rid Record ID.
     * @param {Object} data Data
     * @param {String} format Data format. (json|text)
     * @param {String} updateMethod 更新方式 (replaceRecord|replaceField)
     * @param {Number} timeout timeout (ms)
     */
    async rupdate(rid, data, format, updateMethod='replaceRecord', timeout=20000) {
        if(!rid) {
            throw new ParametersParseError(errorMessage.MISSING_ID_PARAMETER);
        }
        if(!data) {
            throw new ParametersParseError(errorMessage.MISSING_DATA_PARAMETER);
        }
        if(format !== 'text' && format !== 'json') {
            throw new ParametersParseError(errorMessage.WRONG_FORMAT_PARAMETER);
        }
        if(format === 'text' && typeof data !== 'string') {
            throw new ParametersParseError(errorMessage.WRONG_FORMAT);
        }
        if(format === 'json') {
            try {
                if(typeof data === 'object') {
                    data = JSON.stringify(data);
                } else {
                    JSON.parse(data);
                }
            } catch(err) {
                throw new ParametersParseError(`${errorMessage.WRONG_FORMAT}, ${err}`);
            }
        }
        if(updateMethod !== 'replaceRecord' && updateMethod !== 'replaceField') {
            throw new ParametersParseError(errorMessage.WRONG_UPDATE_METHOD_PARAMETER);
        }
        
        let uri = `${this.API}/rupdate`;
        let qs = {
            rid,
            format,
            db: this.db,
            getrec: 'n',
            out: 'json'
        };

        if(updateMethod === 'replaceRecord') {
            qs.record = data;
        } else {
            qs.field = data;
        }

        let opts = {
            uri,
            timeout,
            qs,
            method: 'POST',
            json: true
        };
        return this.execute(opts);
    }

    async execute(options) {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await request(options);
                resolve(result);
            } catch(err) {
                reject(err.error);
            }
        });
    }
}

module.exports.Nudb = Nudb;
