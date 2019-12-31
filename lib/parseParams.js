const fs = require('fs');
const { ParametersParseError } = require('./customFundation/errorHandler');
const errorMessage = require('./customFundation/errorHandler/customErrorMessage');

function getParams(value) {
  if(!value) {
    throw new ParametersParseError(errorMessage.MISSING_PARAMETER);
  }
  
  // Empty array
  if(value.length === 0) {
    throw new ParametersParseError(errorMessage.MISSING_PARAMETER);
  }

  // Empty object
  if(typeof value === 'object' && Object.keys(value).length === 0) {
    throw new ParametersParseError(errorMessage.MISSING_PARAMETER);
  }

  return value;
}

function getParamsQuery(value) {
  if(!value) {
    throw new ParametersParseError(errorMessage.MISSING_PARAMETER);
  }

  if(typeof value !== 'object') {
    throw new ParametersParseError(errorMessage.WRONG_QUERY_PARAMETER);
  }

  // Empty object
  if(typeof value === 'object' && Object.keys(value).length === 0) {
    throw new ParametersParseError(errorMessage.MISSING_PARAMETER);
  }

  return value;
}

function getParamsFile(value) {
  if(!value) {
    throw new ParametersParseError(errorMessage.MISSING_PARAMETER);
  }

  if(!fs.existsSync(value)) {
    throw new ParametersParseError(errorMessage.FILE_NOT_EXISTS);
  }

  return value;
}

function getParamsFormat(value) {
  const allowValueList = ['json', 'text'];

  if(allowValueList.includes(value)) {
    return value;
  }
  
  throw new ParametersParseError(errorMessage.WRONG_FORMAT_PARAMETER);
}

function getParamsData(value, format) {
  let result = value;

  if(!value) {
    throw new ParametersParseError(errorMessage.MISSING_PARAMETER);
  }

  if(format === 'text' && typeof value !== 'string') {
    throw new ParametersParseError(errorMessage.WRONG_FORMAT);
  }

  if(format === 'json') {
    try {
      if(typeof value === 'object') {
        result = JSON.stringify(value);
      } else {
        JSON.parse(value);
      }
    } catch(err) {
      throw new ParametersParseError(`${errorMessage.WRONG_FORMAT}, ${err}`);
    }
  }

  return result;
}

function getParamsSearchField(value, defaultValue) {
  const allowValueList = ['rid', 'key'];

  if(allowValueList.includes(value)) {
    return value;
  }

  return defaultValue || allowValueList[0];
}

function getParamsUpdateMethod(value, defaultValue) {
  const allowValueList = ['replaceRecord', 'replaceField'];

  if(allowValueList.includes(value)) {
    return value;
  }

  return defaultValue || allowValueList[0];
}

function getParamsDataField(value, defaultValue) {
  const mappingValue = {
    replaceRecord: 'record',
    replaceField: 'field'
  };

  if(mappingValue[value]) {
    return mappingValue[value];
  }

  return defaultValue || mappingValue.replaceRecord;
}

function getParamsOut(value, defaultValue) {
  const allowValueList = ['json', 'text'];

  if(allowValueList.includes(value)) {
    return value;
  }

  return defaultValue || allowValueList[0];
}

function getParamsTimeout(value, defaultValue) {
  if(value) {
    return value;
  }

  return defaultValue || 10000;
}


module.exports = {
  getParams,
  getParamsQuery,
  getParamsFile,
  getParamsFormat,
  getParamsData,
  getParamsSearchField,
  getParamsUpdateMethod,
  getParamsDataField,
  getParamsOut,
  getParamsTimeout
};