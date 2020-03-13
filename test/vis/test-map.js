import geoMap from '../../src/vis/map';
import {csv} from 'd3-request';
// import airports from '../assets/airports.json';

export default function() {
    csv('/assets/governments.csv', function(rows){

        let data = {
            json: rows,
            join: {
                field: 'ISO Country code',
                type: 'code'
            },
            vmap: {
                color: 'population'
            }
        };
    
        let view = {
            container: '#examples',
            width: 1000,
            height: 800,
            scale: 150,
            projection: 'Mercator',
            colorMap: 'interpolateReds',
            hover: {
                'stroke-width': 3,
                fill: '#eee', 
            },
            click: d => {console.log(d)},
            showTip: d => d.indicator,
            padding: {left: 0, right: 0, top: 0, bottom: 0},
        }
    
        let testMap = new geoMap(data, view).render();
        // testMap.addLayer({type: 'point', data: airports, feature: 'airports'});
        testMap.addCircles({
            data: [
                {x: -122.490402, y: 37.786453, value: 5},
                {x: -102.389809, y: 37.72728, value: 15},
            ],
            vmap: {
                x: 'x', y: 'y', size: 'value',
                hover: true,
                showTip: d => d.value,
                click: d => {console.log(d)}
            },
            style: {
                color: 'yellow'
            }
        })
    })

}