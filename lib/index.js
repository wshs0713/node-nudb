'use strict';

let fs = require('fs');
let request = require('request-promise');

class Nudb
{
    constructor()
    {
        this.API = "http://localhost:5800/nudb/";
        this.db = "test";
    }

    connect(host, port, db)
    {
        this.API = "http://" + host + ":" + port + "/nudb/";
        this.db = db;
        console.log("[Connect] " + this.API + "\tdb: " + this.db);
    }

    async search(query)
    {
        let url = this.API + 'query';
        let opts = {
            method: 'GET',
            url: url,
            qs: query
        };
        return this.execute(opts);
    }

    async rget(rid)
    {
        let url = this.API + 'rget';
        let opts = {
            method: 'GET',
            url: url,
            qs: {
                db: this.db,
                rid: rid,
                out: 'json'
            }
        }
        return this.execute(opts);
    }

    async rput(data, format, recBeg)
    {
        let url = this.API + 'rput';
        let qs;

        if(format != 'text' && format != 'json')
            return 'Wrong format. Must be \'json\' or \'text\'.';
        else if(format == 'text')
        {
            // 檢查是否有recBeg
            if(recBeg == undefined || recBeg == "" || recBeg == null)
                return 'Must have recBeg.';
            else 
            {
                qs = {
                    db: this.db,
                    data: data,
                    format: format,
                    recBeg: recBeg
                };
            }
        }
        else if(format == 'json')
        {
            //檢查data是string 或 object
            if(typeof(data) == 'object')
            {
                console.log("It's an object");
                data = JSON.stringify(data);
            }
            qs = {
                db: this.db,
                data: data,
                format: format
            };
        }

        let opts = {
            method: 'POST',
            url: url,
            qs: qs
        };
        return this.execute(opts);
    }

    async fput(file, format, recBeg)
    {
        let url = this.API + 'fput';
        let qs;

        if(format != 'text' && format != 'json')
            return 'Wrong format. Must be \'json\' or \'text\'.';
        else if(format == 'text')
        {
            // 檢查是否有recBeg
            if(recBeg == undefined || recBeg == "" || recBeg == null)
                return 'Must have recBeg.';
            else
            {
                qs = {
                    db: this.db,
                    format: format,
                    recBeg: recBeg
                };
            }
        }
        else if(format == 'json')
        {
            qs = {
                db: this.db,
                format: format
            };
        }

        let opts = {
            method: 'POST',
            url: url,
            formData: {
                file: fs.createReadStream(file)
            },
            qs: qs
        };
        return this.execute(opts);
    }
    async rdel(rid)
    {
        let url = this.API + "rdel";
        let opts = {
            method: 'POST',
            url: url,
            qs: {
                db: this.db,
                rid: rid,
                out: 'json'
            }
        };
        return this.execute(opts);
    }
    async rupdate(rid, data, format)
    {
        let url = this.API + "rupdate";
        if(format != 'text' && format != 'json')
            return 'Wrong format. Must be \'json\' or \'text\'.';
        else
        {
            //檢查data是string 或 object
            if((format == 'json') && (typeof(data) == 'object'))
            {
                console.log("It's an object");
                data = JSON.stringify(data);
            }
            let opts = {
                method: 'POST',
                url: url,
                qs: {
                    db: this.db,
                    rid: rid,
                    format: format,
                    record: data,
                    getrec: 'n',
                    out: 'json'
                }
            };
            console.log(data);
            console.log(opts);
            return this.execute(opts);
        }
    }
    async execute(options)
    {
        try
        {
            let result = await request(options);
            return result;
        }
        catch(err)
        {
            console.log('Error: ' + err.message);
            return err;
        }
    }
}

module.exports.Nudb = Nudb;
