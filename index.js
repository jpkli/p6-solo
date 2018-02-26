var root = typeof self == 'object' && self.self === self && self ||
           typeof global == 'object' && global.global === global && global ||
           this;

var p6Solo = {
    allocate    : require('./src/allocate'),
    arrays      : require('./src/array'),
    aggregate   : require('./src/aggregate'),
    pipeline    : require('./src/pipeline'),
    derive      : require('./src/derive'),
    match       : require('./src/match'),
    join        : require('./src/join'),
    stats       : require('./src/stats'),
    embed       : require('./src/embed'),
    toArray     : require('./src/toarray')
};

if(typeof root.p6 == 'object') {
    root.p6.solo = p6Solo;
} else {
    root.p6Solo = p6Solo;
}

if(typeof module != 'undefined' && module.exports)
    module.exports = root.p6Solo;
