var root = typeof self == 'object' && self.self === self && self ||
           typeof global == 'object' && global.global === global && global ||
           this;

var p6Solo = {
    allocate    : require('./src/allocate'),
    arrays      : require('./src/array'),
    pipeline    : require('./src/pipeline'),
    aggregate   : require('./src/aggregate'),
    derive      : require('./src/derive'),
    match       : require('./src/match'),
    stats       : require('./src/stats'),
    join        : require('./src/join'),
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
