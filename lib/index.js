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
     * @param {Number} timeout timeout (ms), default is 20000(ms).
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
     * @param {Number} timeout timeout (ms) (Default=20000)
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
     * Get data by rid or primary key.
     * @param {String} id Record ID or primary key.
     * @param {string} searchField 搜尋的欄位 (rid|key), default is rid.
     * @param {Number} timeout timeout (ms), default is 20000(ms).
     */
    async rget(id, searchField='rid', timeout=20000) {
        if(!id) {
            throw new ParametersParseError(errorMessage.MISSING_ID_PARAMETER);
        }
        if(searchField !== 'rid' && searchField !== 'key') {
            throw new ParametersParseError(errorMessage.WRONG_SEARCH_FIELD_PARAMETER);
        }

        let uri = `${this.API}/rget`;
        let opts = {
            uri,
            timeout,
            method: 'GET',
            qs: {
                db: this.db,
                out: 'json'
            },
            json: true
        };

        if(searchField === 'rid') {
            opts.qs.rid = id;
        } else {
            opts.qs.key = id;
        }

        return this.execute(opts);
    }

    /**
     * Insert data to DB.
     * @param {Object} data Data
     * @param {String} format Data format. (json|text)
     * @param {String} recBeg Record begin pattern. If format is 'text', must have recBeg.
     * @param {Number} timeout timeout (ms), default is 20000(ms).
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
     * @param {Number} timeout timeout (ms), default is 20000(ms).
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
     * Delete record by rid or primary key.
     * @param {String} id Record ID or primary key.
     * @param {string} searchField 搜尋的欄位 (rid|key), default is rid.
     * @param {Number} timeout timeout (ms), default is 20000(ms).
     */
    async rdel(id, searchField='rid', timeout=20000) {
        if(!id) {
            throw new ParametersParseError(errorMessage.MISSING_ID_PARAMETER);
        }
        if(searchField !== 'rid' && searchField !== 'key') {
            throw new ParametersParseError(errorMessage.WRONG_SEARCH_FIELD_PARAMETER);
        }

        let uri = `${this.API}/rdel`;
        let opts = {
            uri,
            timeout,
            method: 'POST',
            qs: {
                db: this.db,
                out: 'json'
            },
            json: true
        };

        if(searchField === 'rid') {
            opts.qs.rid = id;
        } else {
            opts.qs.key = id;
        }

        return this.execute(opts);
    }

    /**
     * Update record by rid or primary key.
     * @param {String} id Record ID or primary key.
     * @param {Object} data Data
     * @param {String} format Data format. (json|text)
     * @param {string} searchField 搜尋的欄位 (rid|key), default is rid.
     * @param {String} updateMethod 更新方式 (replaceRecord|replaceField), default is replaceRecord.
     * @param {Number} timeout timeout (ms), default is 20000(ms).
     */
    async rupdate(id, data, format, searchField='rid', updateMethod='replaceRecord', timeout=20000) {
        if(!id) {
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
        if(searchField !== 'rid' && searchField !== 'key') {
            throw new ParametersParseError(errorMessage.WRONG_SEARCH_FIELD_PARAMETER);
        }
        if(updateMethod !== 'replaceRecord' && updateMethod !== 'replaceField') {
            throw new ParametersParseError(errorMessage.WRONG_UPDATE_METHOD_PARAMETER);
        }
        
        let uri = `${this.API}/rupdate`;
        let qs = {
            format,
            db: this.db,
            getrec: 'n',
            out: 'json'
        };

        if(searchField === 'rid') {
            qs.rid = id;
        } else {
            qs.key = id;
        }

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
