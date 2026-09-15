import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const FamilyTree = ({ data, onNodeClick, activeNodeId }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const gRef = useRef();
  const zoomRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!activeNodeId || !gRef.current || !zoomRef.current || !svgRef.current) return;

    const timeoutId = setTimeout(() => {
      const svg = d3.select(svgRef.current);
      const nodes = d3.select(gRef.current).selectAll('.node');

      const filtered = nodes.filter((d) => d.data.id === activeNodeId);
      if (filtered.size() === 0) return;

      const targetNode = filtered.datum();
      if (!targetNode) return;

      const transform = d3.zoomIdentity
        .translate(dimensions.width / 2 - targetNode.x, dimensions.height / 2 - targetNode.y)
        .scale(1.2);

      svg.transition().duration(1500).ease(d3.easeCubicInOut).call(zoomRef.current.transform, transform);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [activeNodeId, dimensions]);

  // Effect A: build the tree once when data/dimensions change
  useEffect(() => {
    if (!data || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 120, bottom: 40, left: 120 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;
    void width;
    void height;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    gRef.current = g.node();

    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    const nodeSpacingHorizontal = 180;
    const nodeSpacingVertical = 250;
    const tree = d3.tree().nodeSize([nodeSpacingHorizontal, nodeSpacingVertical]);

    const root = d3.hierarchy(data);
    tree(root);

    const initialZoom = d3.zoomIdentity.translate(dimensions.width / 2, 80).scale(0.8);
    svg.call(zoom.transform, initialZoom);

    const linkGenerator = (d) => {
      const { source, target } = d;
      const midY = (source.y + target.y) / 2;
      const radius = 20;

      const sx = source.x;
      const sy = source.y;
      const tx = target.x;
      const ty = target.y;

      if (sx === tx) {
        return `M${sx},${sy} L${tx},${ty}`;
      }

      const sign = tx > sx ? 1 : -1;
      const actualRadius = Math.min(
        radius,
        Math.abs(tx - sx) / 2,
        Math.abs(midY - sy),
        Math.abs(ty - midY)
      );

      return `
        M ${sx},${sy}
        L ${sx},${midY - actualRadius}
        Q ${sx},${midY} ${sx + sign * actualRadius},${midY}
        L ${tx - sign * actualRadius},${midY}
        Q ${tx},${midY} ${tx},${midY + actualRadius}
        L ${tx},${ty}
      `;
    };

    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link-path')
      .attr('d', linkGenerator);

    const node = g
      .selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr(
        'class',
        (d) => `node ${d.children ? 'node--internal' : 'node--leaf'} cursor-pointer`
      )
      .attr('transform', (d) => `translate(${d.x},${d.y})`)
      .style('pointer-events', 'all')
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick(d.data);
      });

    const filter = svg.append('defs').append('filter').attr('id', 'glow');

    filter.append('feGaussianBlur').attr('stdDeviation', '3.5').attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    node
      .append('circle')
      .attr('r', 10)
      .attr('data-id', (d) => d.data.id)
      .attr('class', 'node-circle');

    node
      .append('text')
      .attr('dy', '2.2em')
      .attr('x', 0)
      .attr('text-anchor', 'middle')
      .attr('class', 'node-label font-bold text-xs')
      .text((d) => d.data.name);

    node
      .append('text')
      .attr('dy', '3.6em')
      .attr('x', 0)
      .attr('text-anchor', 'middle')
      .attr('class', 'node-year opacity-70')
      .text((d) => (d.data.birthYear ? `${d.data.birthYear} - ${d.data.deathYear || ''}` : ''));
  }, [data, dimensions, onNodeClick]);

  // Effect B: only update active node styling on change
  useEffect(() => {
    if (!gRef.current) return;
    const nodes = d3.select(gRef.current).selectAll('.node circle');
    nodes.attr(
      'class',
      function () {
        const d = d3.select(this).datum();
        if (!d) return 'node-circle';
        return `node-circle ${
          d.data.id === activeNodeId
            ? 'stroke-gold stroke-[4px] filter drop-shadow-[0_0_15px_rgba(212,175,55,1)]'
            : ''
        }`;
      }
    );
  }, [activeNodeId]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[700px] relative overflow-hidden bg-black/50 border-t border-b border-gold/10"
    >
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h3 className="text-gold font-serif text-xl tracking-widest">Lineage Landscape</h3>
        <p className="text-[10px] text-parchment/30 uppercase tracking-[0.2em] italic">
          Drag to explore / Scroll to zoom
        </p>
      </div>
      <svg ref={svgRef} width="100%" height="100%" className="cursor-move" />
    </div>
  );
};

export default FamilyTree;
