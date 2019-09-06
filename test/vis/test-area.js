import AreaChart from '../src/area';

export default function() {

    let data = {
        json: [
            {time: 1, value: 130},
            {time: 2, value: 391},
            {time: 3, value: 230},
            {time: 4, value: 630},
            {time: 5, value: 500},
        ],
        vmap: {
            x: 'time',
            y: 'value',
            color: 'steelblue'
        }
    }

    let view = {
        container: 'body',
        width: 800,
        height: 500,
        padding: {left: 100, right: 10, top: 10, bottom: 60},
        axes: true
    }

    let area = new AreaChart(data, view);
    area.render();
}

