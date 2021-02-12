import * as d3 from 'd3';

d3.csv('/penguins.csv', d3.autoType).then((data) => {
    let columns = data.columns.filter((d) => typeof data[0][d] === 'number');
    let width = 1000;
    let padding = 30;
    let size =
        (width - (columns.length + 1) * padding) / columns.length + padding;

    let x = columns.map((c) =>
        d3
            .scaleLinear()
            .domain(d3.extent(data, (d) => d[c]))
            .rangeRound([padding / 2, size - padding / 2]),
    );
    let y = x.map((x) => x.copy().range([size - padding / 2, padding / 2]));
    let z = d3
        .scaleOrdinal()
        .domain(data.map((d) => d.species))
        .range(d3.schemeTableau10);

    const svg = d3
        .select('#splom')
        .append('svg')
        .attr('viewBox', `${-padding} 0 ${width} ${width}`)
        .style('max-width', '100%')
        .style('height', 'auto');

    const xAxis = d3
        .axisBottom()
        .ticks(6)
        .tickSize(size * columns.length);
    svg.append('g')
        .selectAll('g')
        .data(x)
        .join('g')
        .attr('transform', (d, i) => `translate(${i * size},0)`)
        .each(function (d) {
            return d3.select(this).call(xAxis.scale(d));
        })
        .call((g) => g.select('.domain').remove())
        .call((g) => g.selectAll('.tick line').attr('stroke', '#ddd'));

    const yAxis = d3
        .axisLeft()
        .ticks(6)
        .tickSize(-size * columns.length);
    svg.append('g')
        .selectAll('g')
        .data(y)
        .join('g')
        .attr('transform', (d, i) => `translate(0,${i * size})`)
        .each(function (d) {
            return d3.select(this).call(yAxis.scale(d));
        })
        .call((g) => g.select('.domain').remove())
        .call((g) => g.selectAll('.tick line').attr('stroke', '#ddd'));

    const cell = svg
        .append('g')
        .selectAll('g')
        .data(d3.cross(d3.range(columns.length), d3.range(columns.length)))
        .join('g')
        .attr('transform', ([i, j]) => `translate(${i * size},${j * size})`);

    cell.append('rect')
        .attr('fill', 'none')
        .attr('stroke', '#aaa')
        .attr('x', padding / 2 + 0.5)
        .attr('y', padding / 2 + 0.5)
        .attr('width', size - padding)
        .attr('height', size - padding);

    cell.each(function ([i, j]) {
        d3.select(this)
            .selectAll('circle')
            .data(
                data.filter(
                    (d) => !isNaN(d[columns[i]]) && !isNaN(d[columns[j]]),
                ),
            )
            .join('circle')
            .attr('cx', (d) => x[i](d[columns[i]]))
            .attr('cy', (d) => y[j](d[columns[j]]));
    });

    const circle = cell
        .selectAll('circle')
        .attr('r', 5.5)
        .attr('fill-opacity', 0.7)
        .attr('fill', (d) => z(d.species));

    svg.append('g')
        .selectAll('text')
        .data(columns)
        .join('text')
        .attr('transform', (d, i) => `translate(${i * size},${i * size})`)
        .attr('x', padding)
        .attr('y', padding)
        .attr('dy', '.71em')
        .text((d) => d);
});
