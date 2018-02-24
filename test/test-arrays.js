var assert = require('assert'),
    arrays = require('../src/array');

var data1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0];
var data2 = [1, 2, 3, 1, 2, 3, 7, 8, 9, 10, 10];
// var data3 = [2, 4, 6, 5, 7, 9, 14, 16, 18, 20, 10];


describe('array', function() {

    console.log('  data1:', data1);
    console.log('  data2:', data2);
    // console.log('  data3:', data3);

    describe('#sum(data1)', function() {
        it('should add up to 55', function() {
            assert.equal(arrays.sum(data1), 55);
        });
    });

    describe('#avg(data1)', function() {
        it('should equal to 5', function() {
            assert.equal(arrays.avg(data1), 5);
        });
    });

    describe('#min(data1)', function() {
        it('should be 0', function() {
            assert.equal(arrays.min(data1), 0);
        });
    });

    describe('#max(data1)', function() {
        it('should be 10', function() {
            assert.equal(arrays.max(data1), 10);
        });
    });

    describe('#unique(data2)', function() {
        it('should only contain unique numbers', function() {
            assert.deepEqual(arrays.unique(data2), [1,2,3,7,8,9,10]);
        });
    });

    describe('#diff(data1, data2)', function() {
        it('should only contain numbers in data1 but not in data2', function() {
            assert.deepEqual(arrays.diff(data1, data2), [4,5,6,0]);
        });
    });

    describe('#intersect(data1, data2)', function() {
        it('should only contain unique numbers', function() {
            assert.deepEqual(arrays.intersect(data1, data2), [1,2,3,7,8,9,10]);
        });
    });

});
