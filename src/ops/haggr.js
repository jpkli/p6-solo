export default function(data, keys) {
    var bins = {},
        keys = Array.isArray(keys) ? keys : [keys];

    data.forEach((d)=>{
        var hash = keys.map((k)=>d[k]).join('');
        bins[hash] = 0;
    })
    bins = Object.keys(bins);

    var results = new Array(bins.length).fill({items:[]});

    data.map(function(d){
        var hash = keys.map((k)=>d[k]).join('');
        var ri = bins.indexOf(hash);

        keys.forEach((k)=>{
            results[ri][k] = d[k];
        });
        result[ri].items.push(d);
    })

    return results;
}
