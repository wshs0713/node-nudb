class NudbClientError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NudbClientError';
    }
}

class ParametersParseError extends NudbClientError {
    constructor(message) {
        super(message);
        Error.captureStackTrace(this, ParametersParseError);
        this.name = 'ParametersParseError';
        this.message = message || 'Parameters Parse Error';
    }
}

module.exports = {
    NudbClientError,
    ParametersParseError
};