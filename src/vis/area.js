import Plot from './plot';
import {area, curveBasis} from 'd3-shape';

export default class AreaChart extends Plot {
   
    constructor(data, view) {
        super(data, view);
        this.render();
    }

    render() {
        let vmap = this.data.vmap;
        super.axes();
        let shape = area()
            .curve(curveBasis)
            .x(d => this.scales.x(d[vmap.x]))
            .y0(this.height)
            .y1(d => this.scales.y(d[vmap.y]));

        this.svg.main.append("path")
            .datum(this.data.json)
            .attr("d", shape)
            .style("fill", vmap.color)
            .style("fill-opacity", vmap.opacity)
            .style("stroke-width", 0)
    }
}