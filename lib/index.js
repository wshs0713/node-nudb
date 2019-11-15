const fs = require('fs');
const request = require('request-promise');
const errorMessage = require('./customErrorMessage');
const { ParametersParseError } = require('./error');

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
     * @param {Number} timeout timeout (ms), default is 10000(ms).
     */
  async getDBInfo(db, timeout=10000) {
    if(!db) {
      throw new ParametersParseError(errorMessage.MISSING_DB_PARAMETER);
    }

    const options = {
      timeout,
      uri: `${this.API}/getDBInfo`,
      method: 'GET',
      qs: {
        db,
        out: 'json'
      },
      json: true
    };
    return this.execute(options);
  }

  /**
     * Search
     * @param {Object} query Query object.
     * @param {Number} timeout timeout (ms) (Default=10000)
     */
  async search(query, timeout=10000) {
    if(!query) {
      throw new ParametersParseError(errorMessage.MISSING_QUERY_PARAMETER);
    }

    const options = {
      timeout,
      uri: `${this.API}/query`,
      method: 'GET',
      qs: query,
      json: true
    };

    return this.execute(options);
  }

  /**
     * Get data by rid or primary key.
     * @param {String} id Record ID or primary key.
     * @param {string} searchField 搜尋的欄位 (rid|key), default is rid.
     * @param {Number} timeout timeout (ms), default is 10000(ms).
     */
  async rget(id, searchField='rid', timeout=10000) {
    if(!id) {
      throw new ParametersParseError(errorMessage.MISSING_ID_PARAMETER);
    }
    if(searchField !== 'rid' && searchField !== 'key') {
      throw new ParametersParseError(errorMessage.WRONG_SEARCH_FIELD_PARAMETER);
    }

    const options = {
      timeout,
      uri: `${this.API}/rget`,
      method: 'GET',
      qs: {
        db: this.db,
        [searchField]: id,
        out: 'json'
      },
      json: true
    };
    return this.execute(options);
  }

  /**
     * Insert data to DB.
     * @param {Object} data Data
     * @param {String} format Data format. (json|text)
     * @param {String} recBeg Record begin pattern. If format is 'text', must have recBeg.
     * @param {Number} timeout timeout (ms), default is 10000(ms).
     */
  async rput(data, format, recBeg=null, timeout=10000) {
    let normalizeData = data;

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
          normalizeData = JSON.stringify(data);
        } else {
          JSON.parse(data);
        }
      } catch(err) {
        throw new ParametersParseError(`${errorMessage.WRONG_FORMAT}, ${err}`);
      }
    }

    const options = {
      timeout,
      uri: `${this.API}/rput`,
      qs: {
        format,
        db: this.db,
        data: normalizeData,
        recbeg: format === 'text' ? recBeg : ''
      },
      method: 'POST',
      json: true
    };
    return this.execute(options);
  }

  /**
     * Insert data from file.
     * @param {String} file File path.
     * @param {String} format Data format. (json|text)
     * @param {String} recBeg Record begin pattern. If format is 'text', must have recBeg.
     * @param {Number} timeout timeout (ms), default is 120000(ms).
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

    const options = {
      timeout,
      uri: `${this.API}/fput`,
      qs: {
        format,
        db: this.db,
        out: 'json',
        recbeg: format === 'text' ? recBeg : ''
      },
      method: 'POST',
      formData: {
        file: fs.createReadStream(file)
      },
      json: true
    };
    return this.execute(options);
  }

  /**
     * Delete record by rid or primary key.
     * @param {String} id Record ID or primary key.
     * @param {string} searchField 搜尋的欄位 (rid|key), default is rid.
     * @param {Number} timeout timeout (ms), default is 10000(ms).
     */
  async rdel(id, searchField='rid', timeout=10000) {
    if(!id) {
      throw new ParametersParseError(errorMessage.MISSING_ID_PARAMETER);
    }
    if(searchField !== 'rid' && searchField !== 'key') {
      throw new ParametersParseError(errorMessage.WRONG_SEARCH_FIELD_PARAMETER);
    }

    const options = {
      timeout,
      uri: `${this.API}/rdel`,
      method: 'POST',
      qs: {
        db: this.db,
        [searchField]: id,
        out: 'json'
      },
      json: true
    };
    return this.execute(options);
  }

  /**
     * Update record by rid or primary key.
     * @param {String} id Record ID or primary key.
     * @param {Object} data Data
     * @param {String} format Data format. (json|text)
     * @param {string} searchField 搜尋的欄位 (rid|key), default is rid.
     * @param {String} updateMethod 更新方式 (replaceRecord|replaceField), default is replaceRecord.
     * @param {Number} timeout timeout (ms), default is 10000(ms).
     */
  async rupdate(id, data, format, searchField='rid', updateMethod='replaceRecord', timeout=10000) {
    let normalizeData = data;

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
          normalizeData = JSON.stringify(data);
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

    const dataField = updateMethod === 'replaceRecord' ? 'record' : 'field';
    const options = {
      timeout,
      uri: `${this.API}/rupdate`,
      qs: {
        format,
        db: this.db,
        [searchField]: id,
        [dataField]: normalizeData,
        getrec: 'n',
        out: 'json'
      },
      method: 'POST',
      json: true
    };
    return this.execute(options);
  }

  async execute(options) {
    return await request(options).then((result) => {
      return result;
    }).catch((err) => {
      throw new Error(err.error);
    });
  }
}

module.exports.Nudb = Nudb;
