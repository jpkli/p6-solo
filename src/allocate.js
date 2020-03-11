/**
 * alloc(options) - allocating memory for storing data values in different schemaures.
 * @exports allocate
 * @param {Object} options - Options for allocating memory.
 * @param {Array} options.array - Array containing the data values.
 * @param {Array} options.fields - Fields in the data.
 * @param {number} [options.skip=0] - Number of rows to be skiped in data.
 * @param {object[]} [options.data] - default data
 *
 */
export default function allocate(options) {
    'use strict';
    var array = options.array || [],
        header = options.fields || options.header || array[0],
        types = options.types || [],
        schema = options.schema || undefined,
        skip = options.skip || 0,
        data = options.data || [];

    var ds = {},
        parsers = [];

    if (types.length && typeof(types) == 'string') {
        var ta = [];
        for (var i = 0; i < header.length; i++) {
            ta.push(types);
        }
        types = ta;
    }

    if (typeof schema == 'object') {
        header = Object.keys(schema);
        types = Object.keys(schema).map(function(h) {
            return schema[h];
        });
    }

    if (typeof skip == 'number') {
        for (var j = 0; j < skip; j++)
            array.shift();
    }

    types.forEach(function(t) {
        parsers.push(getParser(t));
    })

    function getParser(type) {
        if (type == 'int' || type.match('veci*')) {
            return function(value) {
                var res = parseInt(value);
                return (isNaN(res)) ? 0 : res;
            };
        } else if (type == 'float' || type.match('vecf*')) {
            return function(value) {
                var res = parseFloat(value);
                return (isNaN(res)) ? 0 : res;
            };
        } else if (['date', 'time', 'datetime'].indexOf(type) != -1) {
            return function(value) {
                return new Date(value);
            };
        } else if (['money', 'price', 'cost'].indexOf(type) != -1) {
            return function(value) {
                return parseFloat(value.substring(1));
            };
        } else {
            return function(value) {
                return value.trim();
            };
        }
    }

    ds.insertRows = function(rows) {
        array = array.concat(rows);
    }
    
    /**
    * @method objectArray
    * @return {Object[]} - Return data as array of objects
    */
    ds.objectArray = function() {
        if (typeof(header) !== 'undefined' && header.length) {
            var l = header.length;
            return array.map(a => {
                var o = {},
                    offset = 0;
                for (var i = 0; i < l; i++) {
                    var k = header[i];
                    if (k.length) {
                        if (types[i].match(/^(veci|vecf)\d+$/)) {
                            var vl = parseInt(types[i].slice(4)),
                                vector = [];
                            a.slice(offset, offset + vl).forEach(function(vi) {
                                vector.push(parsers[i](vi));
                            });
                            o[k] = vector;
                            offset += vl;
                        } else {
                            o[k] = parsers[i](a[offset]);
                            offset++;
                        }
                    }
                }
                return o;
            });
        }
        return [];
    }

    /**
    * @method rowArray
    * @return {Array[]} - data as row arrays
    */
    ds.rowArray = function() {
        array.forEach(function(a) {
            var row = [];
            header.forEach(function(k, i) {
                if (k.length) {
                    row.push(parsers[i](a[i]));
                }
            });
            data.push(row);
        });
        data.fields = header;
        data.schema = 'rowArray';
        return data;
    }

    /**
    * @method collumArray
    * @return {Array[]} - data as column arrays
    */
    ds.columnArray = function() {
        header.forEach(function(k, i) {
            var column = array.map(function(a) {
                return parsers[i](a[i]);
            });
            data.push(column);
        });
        data.fields = header;
        data.schema = 'columnArray';
        return data;
    }
    //TODO: make columnArray extensible like rowArray and objectArray

    return ds;
};
