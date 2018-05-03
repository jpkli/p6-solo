module.exports = function join(dataLeft, dataRight) {
    var len = dataLeft.length,
        keyL = Object.keys(dataLeft[0]),
        keyR = Object.keys(dataRight[0]);
        
    var keys = keyR.filter(function(kr){ return (keyL.indexOf(kr) === -1);});

    keys.forEach(function(k){
        for(var i = 0; i < len; i++) {
            dataLeft[i][k] = dataRight[i][k];    
        }
    });

    return dataLeft;
}
