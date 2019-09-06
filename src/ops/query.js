import arrayOpts from './arrays.js';
import aggregate from './aggregate.js';
import match from './match.js';

var query = {};
query.match = match;
query.group = aggregate;

query.indexBy = function(data, id){
    var indexed = {};
    data.forEach(function(d){
        if(!indexed.hasOwnProperty(d[id])){
            indexed[d[id]] = [ d ];
        } else {
            indexed[d[id]].push(d);
        }
        delete d[id];
    });
    return indexed;
};

// query.list = function(data, id) {
//     return data.map(function(d){return d[id];});
// }

query.range = function(data, id) {
    var array = data.map(function(d){return d[id];});
    return [ arrayOpts.min(array), arrayOpts.max(array) ];
};

query.map = function(data, m) {
    var mf = function(d){return d};
    if(typeof m === "string")
        mf = function(d){return d[m]};
    else if(typeof m === "function")
        mf = m;

    return data.map(mf);
};

// Object.keys(arrayOpts).forEach(function(opt) {
//     query[opt] = function(data, id) {
//         var arr = query.map(data, id);
//         return arrayOpts[opt](arr);
//     }
// });



query.sortBy = function(data, spec) {
    function sortArray(a, b, p) {
        return a[p] > b[p] ? 1 : a[p] < b[p] ? -1 : 0;
    }
    return data.sort(function(a, b){
        var r = 0,
            i = 0,
            attributes = Object.keys(spec),
            al = attributes.length;

        while( r === 0 && i < al ) {
            r = sortArray(a, b, attributes[i]) * spec[attributes[i]];
            i++;
        }
        return r;
    })
};

query.orderBy = function(c, s, o) {
    var spec = {};
    s.forEach(function(ss){
        spec[ss] = o;
    });
    return query.sort(c, spec);
};

query.histogram = function(data, spec, max, min) {
    var result = {};
    for(var key in spec) {
        result[key] = arrayOpts.histogram(data.map(function(d){return d[key]}), spec[key], max, min);
    }
    return result;
};

query.binAggregate = function(data, spec) {
    var attrKey = Object.keys(spec)[0],
        attributes = Object.keys(spec).filter(function(k) { return k != "$data" && k!=attrKey;}) || [],
        embedData = spec.$data || false,
        numBin = spec[attrKey],
        array = data.map(function(d){ return d[attrKey]; }),
        l = array.length,
        min = arrayOpts.min(array),
        max = arrayOpts.max(array),
        range = max - min,
        interval = range / numBin,
        bins = [];


    for(var b = 0; b < numBin; b++) {
        bins[b] = {binID: b, rangeBegin: min + range * (b/(numBin)), rangeEnd: min + range*(b+1)/(numBin), count: 0};
        // if(embedData)
            bins[b].data = [];
        // attributes.forEach(function(attr){
        //     bins[b][attr] = 0;
        // })
    }

    // bins[numBin] = [];

    for(var i = 0; i < l; i++) {
        binID = Math.floor( (array[i] - min) / range * (numBin));
        if(binID == numBin) binID--;
        data[i].binID = binID;
        // if(embedData)
            bins[binID].data.push(data[i]);
        // bins[binID].count++;
        // attributes.forEach(function(attr){
        //     bins[binID][attr] += data[i][attr];
        // });
    }

    spec.$by = "binID";
    delete spec[attrKey];

    var result = query.group(data, spec);
    result = query.indexBy(result, "binID");


    // result.forEach(function(r){
    //     r.rangeBegin = bins[r.binID].rangeBegin;
    //     r.rangeEnd = bins[r.binID].rangeEnd;
    // })

    bins.forEach(function(bin){

        if(result.hasOwnProperty(bin.binID)) {
            attributes.forEach(function(attr){
                bin[attr] = result[bin.binID][0][attr];
            });
            if(embedData) bin.data = result[bin.binID][0].data;
        } else {
            attributes.forEach(function(attr){
                bin[attr] = 0;
            });
        }

    })
    // console.log(bins);
    // return result;
    return bins;
}

query.partition = function(data, numPart) {
    var len = data.length,
        p = Math.ceil(len / numPart),
        pid,
        partitions = [];

    for(var b = 0; b < numPart; b++) {
        partitions[b] = {partition: b, data: [], count: 0};
    }

    for(var i = 0; i < len; i++) {
        pid = Math.floor(i / p);
        partitions[pid].data.push(data[i]);
        partitions[pid].count++;
    }

    return partitions;
}

query.partitionBy = function(data, spec) {
    var len = data.length,
        pid,
        partitions = [],
        key = Object.keys(spec)[0],
        parts = spec[key];

    parts.forEach(function(b, bi) {
        partitions[bi] = {partition: bi, data: [], count: 0, name: b};
    })

    for(var i = 0; i < len; i++) {
        pid = parts.indexOf(data[i][key]);
        if(pid>-1){
            partitions[pid].data.push(data[i]);
            partitions[pid].count++;
        }
    }
    return partitions;
}

query.normalize = function(data, fields) {
    var hash = {};

    fields.forEach(function(f){
        var array = data.map(function(d){ return d[f]; });
        hash[f] = arrayOpts.normalize(array);
    });

    data.forEach(function(d, i){
        fields.forEach(function(f){
            d[f] = hash[f][i];
        });
    });

    return data;
}

query.toColumnArray = function(data) {
    var columnArray = [];
        attributes = Object.keys(data[0]).filter(function(k) { return k; });

    attributes.forEach(function(attr){
        columnArray.push(data.map(function(d){return d[attr];}));
    });

    columnArray.fields = attributes;

    attributes.forEach(function(attr, ai){
        columnArray[attr] = columnArray[ai];
    });

    return columnArray;
}

export default query;
