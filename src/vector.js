module.exports = {
    add: vectorAdd,
    sum: vectorSum,
    avg: vectorAvg
}

function vectorAdd(a, b){
    var c = [];
    a.forEach(function(v, i){
        c[i] = v + b[i];
    });

    return c;
}

function vectorSum(vectors){
    var result = vectors[0],
        numberOfVectors = vectors.length;

    for(var i = 1; i < numberOfVectors; i++){
        result = vectorAdd(result, vectors[i]);
    }

    return result;
}

function _vectorAvg(a, b){
    var c = [];
    a.forEach(function(v, i){
        c[i] = (v + b[i]) * 0.5;
    });

    return c;
}

function vectorAvg(vectors){
    var result = vectors[0],
        numberOfVectors = vectors.length;

    for(var i = 1; i < numberOfVectors; i++){
        result =  _vectorAvg(result, vectors[i]);
    }

    return result;
}
