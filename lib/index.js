const fs = require('fs');
const request = require('request-promise');
const parseParams = require('./parseParams');
const { ParametersParseError } = require('./customFundation/errorHandler');
const errorMessage = require('./customFundation/errorHandler/customErrorMessage');

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
   * @param {Object} options 其他參數設定
   * @param {String} options.out 輸出格式 (json|text), default is json.
   * @param {Number} options.timeout Timeout, default is 10000 ms.
   */
  async getDBInfo(db, options) {
    let queryOptions = {};

    if(arguments.length === 1 && typeof arguments[0] === 'object') {
      queryOptions = Object.assign({}, arguments[0]);
    } else if(arguments.length > 0) {
      queryOptions = Object.assign({}, options);
      queryOptions.db = db;
    } else {
      throw new ParametersParseError(errorMessage.WRONG_PARAMETER);
    }

    const timeout = parseParams.getParamsTimeout(queryOptions.timeout);
    delete queryOptions.timeout;

    queryOptions.db = parseParams.getParams(queryOptions.db);
    queryOptions.out = parseParams.getParamsOut(queryOptions.out);

    const requestOptions = {
      timeout,
      uri: `${this.API}/getDBInfo`,
      method: 'GET',
      qs: queryOptions,
      json: true
    };
  
    return this.execute(requestOptions);
  }

  /**
   * Search
   * @param {Object} query Query object.
   * @param {String} query.db DB name
   * @param {String} query.q query 條件
   * @param {String} query.time 時間條件
   * @param {String} query.orderby 依照指定欄位排序
   * @param {String} query.order 遞增或遞減排序 (decreasing|increasing), deefault is decreasing.
   * @param {Number} query.p page, default is 1.
   * @param {Number} query.ps page size, default is 10.
   * @param {String} query.select 輸出指定欄位
   * @param {String} query.out 輸出格式 (json|text), default is json.
   * @param {Number} timeout Timeout, default is 10000 ms.
   */
  async search(query, timeout=10000) {
    let queryOptions = parseParams.getParams(query);
    queryOptions.db = parseParams.getParams(queryOptions.db || this.db);
    queryOptions.out = parseParams.getParamsOut(queryOptions.out);

    const options = {
      timeout,
      uri: `${this.API}/query`,
      method: 'GET',
      qs: queryOptions,
      json: true
    };

    return this.execute(options);
  }

  /**
   * Get data by rid or primary key.
   * @param {String} id Record ID or primary key.
   * @param {Object} options 其他參數設定
   * @param {String} options.id Record ID or primary key.
   * @param {String} options.searchField 搜尋欄位 (rid|key), default is rid.
   * @param {String} options.out 輸出格式 (json|text), default is json.
   * @param {Number} options.timeout Timeout, default is 10000 ms.
   */
  async rget(id, options) {
    let queryOptions = {};

    if(arguments.length === 1 && typeof arguments[0] === 'object') {
      queryOptions = Object.assign({}, arguments[0]);
    } else if(arguments.length > 0) {
      queryOptions = Object.assign({}, options);
      queryOptions.id = id;
    } else {
      throw new ParametersParseError(errorMessage.WRONG_PARAMETER);
    }

    const searchId = parseParams.getParams(queryOptions.id);
    const searchField = parseParams.getParamsSearchField(queryOptions.searchField);
    const timeout = parseParams.getParamsTimeout(queryOptions.timeout);

    delete queryOptions.id;
    delete queryOptions.searchField;
    delete queryOptions.timeout;

    queryOptions.db = parseParams.getParams(queryOptions.db || this.db);
    queryOptions.out = parseParams.getParamsOut(queryOptions.out);
    queryOptions[searchField] = searchId;

    const requestOptions = {
      timeout,
      uri: `${this.API}/rget`,
      method: 'GET',
      qs: queryOptions,
      json: true
    };

    return this.execute(requestOptions);
  }

  /**
   * Insert data to DB.
   * @param {Object} data Data
   * @param {String} format Data format. (json|text)
   * @param {Object} options 其他參數設定
   * @param {String} options.data Data
   * @param {String} options.format Data format. (json|text)
   * @param {String} options.recbeg Record gegin pattern.
   * @param {String} options.operation 當資料存在時, 執行的動作 (iupdate|rupdate|error)
   * @param {String} options.out 輸出格式 (json|text), default is json.
   * @param {Number} options.timeout Timeout, default is 10000 ms.
   */
  async rput(data, format, options) {
    let queryOptions = {};

    if(arguments.length === 1 && typeof arguments[0] === 'object') {
      queryOptions = Object.assign({}, arguments[0]);
    } else if(arguments.length > 1) {
      queryOptions = Object.assign({}, options);
      queryOptions.data = data;
      queryOptions.format = format;
    } else {
      throw new ParametersParseError(errorMessage.WRONG_PARAMETER);
    }

    const timeout = parseParams.getParamsTimeout(queryOptions.timeout);
    delete queryOptions.timeout;

    queryOptions.db = parseParams.getParams(queryOptions.db || this.db);
    queryOptions.format = parseParams.getParamsFormat(queryOptions.format);
    queryOptions.data = parseParams.getParamsData(queryOptions.data, queryOptions.format);
    queryOptions.out = parseParams.getParamsOut(queryOptions.out);

    if(queryOptions.format === 'text') {
      queryOptions.recbeg = parseParams.getParams(queryOptions.recbeg);
    }

    const requestOptions = {
      timeout,
      uri: `${this.API}/rput`,
      qs: queryOptions,
      method: 'POST',
      json: true
    };

    return this.execute(requestOptions);
  }

  /**
   * Insert data from file.
   * @param {String} file File path.
   * @param {String} format Data format. (json|text)
   * @param {Object} options 其他參數設定
   * @param {String} options.file File path.
   * @param {String} options.format Data format. (json|text)
   * @param {String} options.recbeg Record gegin pattern.
   * @param {String} options.out 輸出格式 (json|text), default is json.
   * @param {Number} options.timeout Timeout, default is 120000 ms.
   */
  async fput(file, format, options) {
    let queryOptions = {};

    if(arguments.length === 1 && typeof arguments[0] === 'object') {
      queryOptions = Object.assign({}, arguments[0]);
    } else if(arguments.length > 1) {
      queryOptions = Object.assign({}, options);
      queryOptions.file = file;
      queryOptions.format = format;
    } else {
      throw new ParametersParseError(errorMessage.WRONG_PARAMETER);
    }

    const timeout = parseParams.getParamsTimeout(queryOptions.timeout, 120000);
    delete queryOptions.timeout;

    queryOptions.db = parseParams.getParams(queryOptions.db || this.db);
    queryOptions.file = parseParams.getParamsFile(queryOptions.file);
    queryOptions.format = parseParams.getParamsFormat(queryOptions.format);
    queryOptions.out = parseParams.getParamsOut(queryOptions.out);

    if(queryOptions.format === 'text') {
      queryOptions.recbeg = parseParams.getParams(queryOptions.recbeg);
    }

    const requestOptions = {
      timeout,
      uri: `${this.API}/fput`,
      qs: queryOptions,
      method: 'POST',
      formData: {
        file: fs.createReadStream(queryOptions.file)
      },
      json: true
    };

    return this.execute(requestOptions);
  }

  /**
   * Delete record by rid or primary key.
   * @param {String} id Record ID or primary key.
   * @param {Object} options 其他參數設定
   * @param {String} options.id Record ID or primary key.
   * @param {String} options.searchField 搜尋欄位 (rid|key), default is rid.
   * @param {String} options.out 輸出格式 (json|text), default is json.
   * @param {Number} options.timeout Timeout, default is 10000 ms.
   */
  async rdel(id, options) {
    let queryOptions = {};

    if(arguments.length === 1 && typeof arguments[0] === 'object') {
      queryOptions = Object.assign({}, arguments[0]);
    } else if(arguments.length > 0) {
      queryOptions = Object.assign({}, options);
      queryOptions.id = id;
    } else {
      throw new ParametersParseError(errorMessage.WRONG_PARAMETER);
    }

    const searchId = parseParams.getParams(queryOptions.id);
    const searchField = parseParams.getParamsSearchField(queryOptions.searchField);
    const timeout = parseParams.getParamsTimeout(queryOptions.timeout);

    delete queryOptions.id;
    delete queryOptions.searchField;
    delete queryOptions.timeout;

    queryOptions.db = parseParams.getParams(queryOptions.db || this.db);
    queryOptions.out = parseParams.getParamsOut(queryOptions.out);
    queryOptions[searchField] = searchId;

    const requestOptions = {
      timeout,
      uri: `${this.API}/rdel`,
      method: 'POST',
      qs: queryOptions,
      json: true
    };

    return this.execute(requestOptions);
  }

  /**
   * Update record by rid or primary key.
   * @param {String} id Record ID or primary key.
   * @param {Object} data Data
   * @param {String} format Data format. (json|text)
   * @param {Object} options 其他參數設定
   * @param {String} options.id Record ID or primary key.
   * @param {Object} options.data Data
   * @param {String} options.format Data format. (json|text)
   * @param {String} options.searchField 搜尋欄位 (rid|key), default is rid.
   * @param {String} options.updateMethod 更新方式 (replaceRecord|replaceField), default is replaceRecord.
   * @param {String} options.out 輸出格式 (json|text), default is json.
   * @param {Number} options.timeout Timeout, default is 10000 ms.
   */
  async rupdate(id, data, format, options) {
    let queryOptions = {};

    if(arguments.length === 1 && typeof arguments[0] === 'object') {
      queryOptions = Object.assign({}, arguments[0]);
    } else if(arguments.length > 2) {
      queryOptions = Object.assign({}, options);
      queryOptions.id = id;
      queryOptions.data = data;
      queryOptions.format = format;
    } else {
      throw new ParametersParseError(errorMessage.WRONG_PARAMETER);
    }

    const searchId = parseParams.getParams(queryOptions.id);
    const searchField = parseParams.getParamsSearchField(queryOptions.searchField);
    const updateMethod = parseParams.getParamsUpdateMethod(queryOptions.updateMethod);
    const dataField = parseParams.getParamsDataField(updateMethod);
    const timeout = parseParams.getParamsTimeout(queryOptions.timeout);

    queryOptions.db = parseParams.getParams(queryOptions.db || this.db);
    queryOptions.format = parseParams.getParamsFormat(queryOptions.format);
    queryOptions.data = parseParams.getParamsData(queryOptions.data, queryOptions.format);
    queryOptions.out = parseParams.getParamsOut(queryOptions.out);
    queryOptions[searchField] = searchId;
    queryOptions[dataField] = queryOptions.data;

    delete queryOptions.id;
    delete queryOptions.searchField;
    delete queryOptions.updateMethod;
    delete queryOptions.timeout;
    delete queryOptions.data;

    const requestOptions = {
      timeout,
      uri: `${this.API}/rupdate`,
      qs: queryOptions,
      method: 'POST',
      json: true
    };

    return this.execute(requestOptions);
  }

  async execute(options) {
    return await request(options).then((result) => {
      return result;
    }).catch((err) => {
      throw new Error(err.message);
    });
  }
}

module.exports.Nudb = Nudb;
