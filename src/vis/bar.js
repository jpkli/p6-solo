import Plot from './plot';
import {scaleBand} from 'd3-scale';
export default class BarChart extends Plot {
    constructor(data, view) {
        super(data, view);
        this.render();
    }

    getDomainY () {
        let vmap = this.data.vmap;

        let domainY;
        if (this.domains[vmap.y].length > 2) {
            domainY = this.domains[vmap.y];
        } else {
            domainY = new Array(this.domains[vmap.y][1] - this.domains[vmap.y][0] + 1).fill(1).map((d, i) => i + this.domains[vmap.y][0]);
        }
        return domainY;
    }

    render() {
        let vmap = this.data.vmap;
        let domainY = this.getDomainY()
        this.scales.y = scaleBand().domain(domainY).range([0, this.height]).padding(this.view.space || 0.05);
        this.domains[vmap.x][0] = 0;
        this.scales.x.domain(this.domains[vmap.x]);
        super.axes();
        this.bars = this.svg.main.selectAll(".p3-vis-bars")
            .data(this.data.json)
          .enter().append("rect")
            .attr('class', 'p3-vis-bars')
            .attr('x', 0)
            .attr('y', d => this.scales.y(d[vmap.y || vmap.height]))
            .style("fill", d => this.scales.color(d[vmap.color]))
            .attr("height", this.scales.y.bandwidth())
            .attr("width", d => this.scales.x(d[vmap.x || vmap.width]));
    }

    resize (w, h) {
        super.resize(w, h)
        let vmap = this.data.vmap;
        let domainY = this.getDomainY();
        this.scales.y = scaleBand().domain(domainY).range([0, this.height]).padding(this.view.space || 0.05);
        this.svg.main.selectAll('.p3-vis-bars')
            .transition().duration(500)
            .attr('y', d => this.scales.y(d[vmap.y || vmap.height]))
            .style("fill", d => this.scales.color(d[vmap.color]))
            .attr("height", this.scales.y.bandwidth())
            .attr("width", d => this.scales.x(d[vmap.x || vmap.width]));
    }

    update (newData, newColor) {
        // debugger
        let vmap = this.data.vmap;

        let bars = this.svg.main.selectAll(".p3-vis-top-bars")
            .data(newData, d => d[vmap.y]);
        
        bars.exit().remove();

        bars.enter().append("rect")
            .attr('class', 'p3-vis-top-bars');

        bars.attr('x', 0)
            .attr('y', d => this.scales.y(d[vmap.y || vmap.height]))
            .style("fill", newColor)
            .attr("height", this.scales.y.bandwidth())
            .attr("width", d => this.scales.x(d[vmap.x || vmap.width]));

    }
}