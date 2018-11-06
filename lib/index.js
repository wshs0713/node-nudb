let fs = require('fs');
let request = require('request-promise');

class Nudb {
    constructor() {
        this.API = 'http://localhost:5800/nudb/';
        this.db = 'test';
    }

    connect(host, port, db) {
        this.API = 'http://' + host + ':' + port + '/nudb/';
        this.db = db;
    }

    async getDBInfo(db) {
        let uri = this.API + 'getDBInfo';
        let opts = {
            uri,
            method: 'GET',
            qs: {
                db,
                out: 'json'
            },
            json: true
        };
        return this.execute(opts);
    }

    async search(query) {
        let uri = this.API + 'query';
        let opts = {
            uri,
            method: 'GET',
            qs: query
        };

        // Automatically parses the JSON string in the response
        if(opts.qs.out == 'json') {
            opts.json = true;
        }

        return this.execute(opts);
    }

    async rget(rid) {
        let uri = this.API + 'rget';
        let opts = {
            uri,
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

    async rput(data, format, recBeg) {
        if(format != 'text' && format != 'json') {
            return 'Wrong format. Must be \'json\' or \'text\'.';
        } else if((format == 'text') && !recBeg) {
            // 檢查 recBeg
            return 'Must have recBeg.';
        } else {
            let uri = this.API + 'rput';
            let qs = {
                data,
                format,
                db: this.db
            };
            
            if(format == 'text') {
                qs.recbeg = recBeg;
            } else if(typeof data == 'object') {
                // Convert JSON object to string
                qs.data = JSON.stringify(data);
            }

            let opts = {
                uri,
                qs,
                method: 'POST',
                json: true
            };
            return this.execute(opts);
        }
    }

    async fput(file, format, recBeg) {
        if(format != 'text' && format != 'json') {
            return 'Wrong format. Must be \'json\' or \'text\'.';
        } else if((format == 'text') && (!recBeg)) {
            // 檢查 recBeg
            return 'Must have recBeg.';
        } else {
            let uri = this.API + 'fput';
            let qs = {
                format,
                db: this.db,
                out: 'json'
            };
            
            if(format == 'text') {
                qs.recbeg = recBeg;
            }

            let opts = {
                uri,
                qs,
                method: 'POST',
                formData: {
                    file: fs.createReadStream(file)
                },
                json: true
            };
            return this.execute(opts);
        }
    }

    async rdel(rid) {
        let uri = this.API + 'rdel';
        let opts = {
            uri,
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

    async rupdate(rid, data, format) {
        if(format != 'text' && format != 'json') {
            return 'Wrong format. Must be \'json\' or \'text\'.';
        } else {
            let uri = this.API + 'rupdate';
            let qs = {
                rid,
                format,
                db: this.db,
                record: data,
                getrec: 'n',
                out: 'json'
            };

            // Convert JSON object to string
            if((format == 'json') && (typeof data == 'object')) {
                qs.record = JSON.stringify(data);
            }

            let opts = {
                uri,
                qs,
                method: 'POST',
                json: true
            };
            return this.execute(opts);
        }
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
