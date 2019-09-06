import p3 from '../index.js'

var root = typeof self == 'object' && self.self === self && self ||
           typeof global == 'object' && global.global === global && global ||
           this;

if(typeof root.p3 == 'object') {
    root.p3 = Object.assign(root.p3, p3);
} else {
    root.p3 = p3;
}
