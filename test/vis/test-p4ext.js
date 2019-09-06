import p4 from 'p4';
import AreaChart from '../../src/vis/area';

export default function() {

    let config = {
        container: 'body',
        viewport: [800, 500]
    };
    
    let views = [
        {
            id: 'main', width: 800, height: 500, 
            padding: {left: 100, right: 10, top: 10, bottom: 40}
        },
    ];
    
    let px = p4(config).view(views);
    
    px.extend({
        name: 'area',
        exportData: true,
        skipDefault: true,
        getContext: false,
        condition: function(vmap) { return vmap.mark === 'area'}, 
        type: 'class',
        function: AreaChart
    })
    
    px.input({
        type: 'json',
        method: 'memory',
        source: p4.datasets.TimeSeries({
            timesteps: 24,
            series: 10,
            interval: 1,
            props: [
                {name: 'traffic', dtype: 'int',  dist: 'normal', min: 0, max: 10000, mean: 500, std: 180},
                {name: 'sattime', dtype: 'float',  dist: 'normal', min: 0, max: 10000, mean: 500, std: 180}
            ]
        })
    })
    .aggregate({
        $group: 'timestamp',
        $reduce: {
            totalTraffic: {$sum: 'traffic'}
        }
    })
    .visualize({
        id: 'main',
        mark: 'area',
        x: 'timestamp',
        y: 'totalTraffic',
        color: 'steelblue',
        zero: true
    })
}
