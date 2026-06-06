/* =========================================================================
 * EDL — plot.js
 * Primitivas reutilizáveis de visualização (construídas sobre D3 v7).
 * Os módulos específicos usam essas primitivas; se precisarem de algo
 * totalmente custom, podem usar D3 diretamente.
 *
 * Exporta: window.EDL.plot
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});

  /**
   * Cria uma estrutura SVG responsiva dentro de `container`, com margens.
   * Retorna { svg, g, width, height, inner } onde inner = {w, h}.
   */
  function createResponsiveSvg(container, {
    ratio = 0.52,               // height/width; 0.52 ≈ 16:8.3
    margin = { top: 18, right: 22, bottom: 42, left: 52 }
  } = {}) {
    const d3 = window.d3;
    const box = container.getBoundingClientRect();
    const width = Math.max(320, box.width || container.clientWidth || 600);
    const height = Math.round(width * ratio);

    const svg = d3.select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('role', 'img')
      .style('display', 'block')
      .style('width', '100%')
      .style('height', 'auto');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    return {
      svg,
      g,
      width,
      height,
      margin,
      inner: {
        w: width - margin.left - margin.right,
        h: height - margin.top - margin.bottom
      }
    };
  }

  /**
   * Eixos com estilo coerente com o tema escuro.
   */
  function addAxes(g, xScale, yScale, innerW, innerH, { xLabel, yLabel } = {}) {
    const d3 = window.d3;
    const axColor = '#6b7a90';
    const gridColor = '#1e2638';

    // Eixo X
    const xAxis = d3.axisBottom(xScale).ticks(Math.min(10, Math.max(4, Math.floor(innerW / 80))));
    g.append('g')
      .attr('class', 'edl-x-axis')
      .attr('transform', `translate(0,${innerH})`)
      .call(xAxis)
      .call(sel => {
        sel.selectAll('path,line').attr('stroke', axColor);
        sel.selectAll('text').attr('fill', '#a8b3c4').style('font-size', '11px').style('font-family', 'Inter, sans-serif');
      });

    // Eixo Y
    const yAxis = d3.axisLeft(yScale).ticks(6);
    g.append('g')
      .attr('class', 'edl-y-axis')
      .call(yAxis)
      .call(sel => {
        sel.selectAll('path,line').attr('stroke', axColor);
        sel.selectAll('text').attr('fill', '#a8b3c4').style('font-size', '11px').style('font-family', 'Inter, sans-serif');
      });

    // Grid horizontal
    g.append('g')
      .attr('class', 'edl-grid-y')
      .call(d3.axisLeft(yScale).ticks(6).tickSize(-innerW).tickFormat(''))
      .call(sel => {
        sel.selectAll('path').attr('stroke', 'none');
        sel.selectAll('line').attr('stroke', gridColor).attr('stroke-dasharray', '2,3');
      });

    if (xLabel) {
      g.append('text')
        .attr('x', innerW / 2)
        .attr('y', innerH + 35)
        .attr('text-anchor', 'middle')
        .attr('fill', '#a8b3c4')
        .style('font-size', '12px')
        .text(xLabel);
    }
    if (yLabel) {
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerH / 2)
        .attr('y', -38)
        .attr('text-anchor', 'middle')
        .attr('fill', '#a8b3c4')
        .style('font-size', '12px')
        .text(yLabel);
    }
  }

  EDL.plot = {
    createResponsiveSvg,
    addAxes
  };
})();
