import Plot from './plot';
import {scaleBand} from 'd3-scale';
export default class BarChart extends Plot {
   
    constructor(data, view) {
        super(data, view);
        this.render();
    }

    render() {
        let vmap = this.data.vmap;
        
        let domainX = new Array(this.domains[vmap.x][1] - this.domains[vmap.x][0] + 1).fill(1).map((d, i) => i + this.domains[vmap.x][0])
        this.scales.x = scaleBand().domain(domainX).range([0, this.width]).padding(0.05);
        super.axes();
        this.svg.main.selectAll(".plot-bars")
            .data(this.data.json)
          .enter().append("rect")
            .attr('class', 'plot-bars')
            .attr('x', d => this.scales.x(d[vmap.x || vmap.width]))
            .attr('y', d => this.scales.y(d[vmap.y || vmap.height]))
            .style("fill", d => this.scales.color(d[vmap.color]))
            .attr("width", this.scales.x.bandwidth())
            .attr("height", d => this.height - this.scales.y(d[vmap.y || vmap.height]));
    }

    update (newData, newColor) {
        // debugger
        let vmap = this.data.vmap;

        let bars = this.svg.main.selectAll(".plot-top-bars")
            .data(newData, d => d[vmap.x])
        
        bars.exit().remove();

        bars.enter().append("rect")
            .attr('class', 'plot-top-bars');

        bars.attr('x', d => this.scales.x(d[vmap.x || vmap.width]))
            .attr('y', d => this.scales.y(d[vmap.y || vmap.height]))
            .style("fill", newColor)
            .attr("width", this.scales.x.bandwidth())
            .attr("height", d => this.height - this.scales.y(d[vmap.y || vmap.height]));

    }
}