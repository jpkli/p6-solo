import Plot from './plot';

export default class ScatterPlot extends Plot {
   
    constructor(data, view) {
        super(data, view);
        this.render();
    }

    render() {
        let vmap = this.data.vmap;

        super.axes();

        this.svg.main.selectAll('.plot-circles')
            .data(this.data.json)
            .enter()
            .append('circle')
                .attr('class', 'plot-circles')
                .attr('cx', d => this.scales.x(d[vmap.x]))
                .attr('cy', d => this.scales.y(d[vmap.y]))
                .attr('r', d => this.scales.size(d[vmap.size]))
                .style("fill", d => this.scales.color(d[vmap.color]))
                .style("fill-opacity", 1)
                .style("stroke-width", 0)
    }
}