var assert = require('assert'),
    pipeline = require('../src/pipeline'),
    _ = require('lodash');

var data = [
    {Gender: "M", Weight: 8,   MotherWeight: 120, MotherRace: 'White'},
    {Gender: "F", Weight: 7.6, MotherWeight: 120, MotherRace: 'Aisan'},
    {Gender: "M", Weight: 9,   MotherWeight: 130, MotherRace: 'Black'},
    {Gender: "F", Weight: 8.2, MotherWeight: 192, MotherRace: 'White'},
    {Gender: "F", Weight: 9.2, MotherWeight: 155, MotherRace: 'Black'},
    {Gender: "M", Weight: 8.8, MotherWeight: 178, MotherRace: 'Asian'},
    {Gender: "M", Weight: 9.6, MotherWeight: 126, MotherRace: 'White'},
    {Gender: "F", Weight: 9.6, MotherWeight: 146, MotherRace: 'White'}
];

var p6OptsToLodashOpts = {
    // $count: 'countBy',
    $sum  : 'sumBy',
    $avg  : 'meanBy',
    $max  : 'maxBy',
    $min  : 'minBy'
}


function runP6Solo(groupKey, opt) {
    var spec = {$group: groupKey};
    spec.$collect = {};
    spec.$collect.w = {};
    spec.$collect.mw = {};
    spec.$collect.w[opt] = 'Weight';
    spec.$collect.mw[opt] = 'MotherWeight';

    return pipeline().data(data).aggregate(spec).execute();
}

function runLodash(groupKey, opt) {
    return _.chain(data).groupBy(groupKey)
         .map(function(value, key) {
             var obj = {};
             obj[groupKey] = key;
             obj.w = _[opt](value,'Weight');
             obj.mw = _[opt](value,'MotherWeight');

             if(opt == 'minBy' || opt == 'maxBy') {
                 obj.w = obj.w.Weight;
                 obj.mw = obj.mw.MotherWeight;
             }
             return obj;
         })
         .value();
}

var result = _.chain(data)

describe('aggregate', function() {

    describe('{$group: "Gender"}', function() {
        it('should return grouped result based on Gender', function() {
            var p6Opts = Object.keys(p6OptsToLodashOpts),
                optsTotal = p6Opts.length;

            for(var i = 0; i < optsTotal; i++ ) {
                assert.deepEqual(
                    runP6Solo('Gender', p6Opts[i]),
                    runLodash('Gender', p6OptsToLodashOpts[p6Opts[i]])
                );
            }
        });
    });

    describe('{$group: "MotherRace"}', function() {
        it('should return grouped result based on MotherRace', function() {
            var p6Opts = Object.keys(p6OptsToLodashOpts),
                optsTotal = p6Opts.length;

            for(var i = 0; i < optsTotal; i++ ) {
                assert.deepEqual(
                    runP6Solo('MotherRace', p6Opts[i]),
                    runLodash('MotherRace', p6OptsToLodashOpts[p6Opts[i]])
                );
            }
        });
    });

});
