const assert = require('assert');
const pipeline = require('../src/pipeline');
const _ = require('lodash');
const randomData = require('./data-random');

var dataProps = [
    {name: 'Gender', values: ['F', 'M'] },
    {name: 'Weight', dtype: 'float', dist: 'normal', min: 2, max: 20, mean: 7, std: 2},
    {name: 'MotherWeight', dtype: 'float', dist: 'normal', min: 50, max: 290, mean: 100, std: 50},
    {name: 'MotherRace', values: ['White', 'Asian', 'Black', 'Mixed'] },
    {name: 'MotherAge', dtype: 'int', dist: 'normal', min: 16, max: 70, mean: 40, std:25}
];

let data = randomData({props: dataProps, size: 10000});
let p3OptsToLodashOpts = {
    // $count: 'countBy',
    $sum  : 'sumBy',
    $avg  : 'meanBy',
    $max  : 'maxBy',
    $min  : 'minBy'
}

let runP3 = function(groupKey, opt) {
    let query = {
        $group: '_groupKey_',
        $collect: {
            w: { _opt_ : 'Weight'},
            mw: { _opt_ : 'MotherWeight'}
        }
    }

    queryStr = JSON.stringify(query)
        .replace('_groupKey_', groupKey)
        .replace(/_opt_/g, opt);

    return pipeline().data(data).aggregate(JSON.parse(queryStr)).execute();
}

let runLodash = function(groupKey, opt) {
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

let result = _.chain(data);

describe('aggregate', function() {

    describe('{$group: "Gender"}', function() {
        it('should return grouped result based on Gender', function() {
            var p6Opts = Object.keys(p3OptsToLodashOpts),
                optsTotal = p6Opts.length;

            for(var i = 0; i < optsTotal; i++ ) {
                assert.deepEqual(
                    runP3('Gender', p6Opts[i]),
                    runLodash('Gender', p3OptsToLodashOpts[p6Opts[i]])
                );
            }
        });
    });

    describe('{$group: "MotherRace"}', function() {
        it('should return grouped result based on MotherRace', function() {
            var p6Opts = Object.keys(p3OptsToLodashOpts),
                optsTotal = p6Opts.length;

            for(var i = 0; i < optsTotal; i++ ) {
                assert.deepEqual(
                    runP3('MotherRace', p6Opts[i]),
                    runLodash('MotherRace', p3OptsToLodashOpts[p6Opts[i]])
                );
            }
        });
    });

});
