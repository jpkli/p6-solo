import geoMap from '../../src/vis/map';
import {csv} from 'd3-request';
// import airports from '../assets/airports.json';
import usaGIS from '../../assets/states-10m.json';

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
            width: 800,
            height: 600,
            scale: 1000,
            projection: 'AlbersUsa',
            colorMap: 'interpolateReds',
            zoom: true,
            hover: {
                'stroke-width': 3,
                fill: 'green', 
            },
            click: {fill: 'blue'},
            showTip: d => d.indicator,
            padding: {left: 0, right: 0, top: 0, bottom: 0},
        }
    
        let testMap = new geoMap({vmap: {}, gis: usaGIS, feature: 'states', }, view).render();
        // testMap.addLayer({type: 'point', data: airports, feature: 'airports'});
        let circles = testMap.addCircles({
            data: [
                {x: -122.490402, y: 37.786453, value: 5},
                {x: -102.389809, y: 37.72728, value: 15},
            ],
            vmap: {
                x: 'x', y: 'y', size: 'value',
                hover: true,
                showTip: d => d.value,
                
            },
            style: {
                color: 'yellow'
            }
        })
        circles
          .attr('cx', d => testMap.projection([d.x, d.y])[0])
          .attr('cy', d => testMap.projection([d.x, d.y])[1])

        testMap.resize(800, 500)
        // testMap.selectRegionByName('California', {fill: 'blue'})
        // testMap.unselectRegion()
    })

}