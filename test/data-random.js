var normalDist = require('jStat').normal.sample;

module.exports = function randomData(arg) {
    var options = arg || {},
        random = {},
        parser = {},
        size = options.size || 0,
        props = options.props || [];

    var data = new Array(size);

    function boundedRandom(p) {
        var value = p.min - 1;
        while ( value < p.min || value > p.max) {
            value = normalDist(p.mean, p.std);
        }
        return value;
    }

    props.forEach(function(p){
        random[p.name] = (p.dist == 'normal') ?  boundedRandom.bind(null, p) : function() { return p.min + (p.max - p.min) * Math.random(); };
        parser[p.name] = (p.dtype == 'float') ? parseFloat : parseInt;
    });

    for(var i = 0; i < size; i++) {
        data[i] = {};
        props.forEach(function(p) {
            if(p.hasOwnProperty('values')){
                data[i][p.name] = p.values[parseInt(p.values.length * Math.random())];
            } else {
                var value = random[p.name]();
                data[i][p.name] = parser[p.name](value);
            }
        });
    }

    return data;
};
