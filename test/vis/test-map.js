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
            container: 'body',
            width: 1000,
            height: 800,
            scale: 150,
            projection: 'Mercator',
            colorMap: 'interpolateReds',
            padding: {left: 50, right: 50, top: 50, bottom: 50},
        }
    
        let testMap = new geoMap(data, view).render();
        // testMap.addLayer({type: 'point', data: airports, feature: 'airports'});
    })

}