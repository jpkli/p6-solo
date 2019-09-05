var root = typeof self == 'object' && self.self === self && self ||
           typeof global == 'object' && global.global === global && global ||
           this;

var p3 = {
    allocate    : require('./src/allocate'),
    arrays      : require('./src/arrays'),
    aggregate   : require('./src/aggregate'),
    pipeline    : require('./src/pipeline'),
    derive      : require('./src/derive'),
    match       : require('./src/match'),
    join        : require('./src/join'),
    stats       : require('./src/stats'),
    embed       : require('./src/embed'),
    toArray     : require('./src/toarray'),
    vector      : require('./src/vector')
};

if(typeof root.p3 == 'object') {
    root.p3 = Object.assign(root.p3, p3);
} else {
    root.p3 = p3;
}

module.exports = p3;
