import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { isHonoree } from '../constants';

const FamilyTree = ({ data, onNodeClick, activeNodeId }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const gRef = useRef();
  const zoomRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [currentZoom, setCurrentZoom] = useState(0.8);

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

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 0.77);
  };

  const handleZoomSlider = (e) => {
    const newScale = parseFloat(e.target.value);
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).call(zoomRef.current.scaleTo, newScale);
    setCurrentZoom(newScale);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomRef.current) return;
    const isMobile = dimensions.width < 768;
    const initialScale = isMobile ? 0.45 : 0.8;
    const initialZoom = d3.zoomIdentity
      .translate(dimensions.width / 2, isMobile ? 60 : 80)
      .scale(initialScale);
    d3.select(svgRef.current)
      .transition()
      .duration(750)
      .ease(d3.easeCubicOut)
      .call(zoomRef.current.transform, initialZoom);
  };

  useEffect(() => {
    if (!activeNodeId || !gRef.current || !zoomRef.current || !svgRef.current) return;

    const timeoutId = setTimeout(() => {
      const svg = d3.select(svgRef.current);
      const nodes = d3.select(gRef.current).selectAll('.node');

      const filtered = nodes.filter((d) => d && d.data && d.data.id === activeNodeId);
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
      .scaleExtent([0.15, 3.5])
      .filter((event) => {
        // Allow wheel, touch gestures (pinch-to-zoom, pan), and left click drag
        return !event.ctrlKey || event.type === 'wheel' || event.type.startsWith('touch');
      })
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setCurrentZoom(event.transform.k);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    const nodeSpacingHorizontal = 180;
    const nodeSpacingVertical = 250;
    const tree = d3.tree().nodeSize([nodeSpacingHorizontal, nodeSpacingVertical]);

    const root = d3.hierarchy(data);
    tree(root);

    const isMobile = dimensions.width < 768;
    const initialScale = isMobile ? 0.45 : 0.8;
    const initialZoom = d3.zoomIdentity
      .translate(dimensions.width / 2, isMobile ? 60 : 80)
      .scale(initialScale);
    svg.call(zoom.transform, initialZoom);
    setCurrentZoom(initialScale);

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

    const honoreeNodes = node.filter((d) => d && d.data && isHonoree(d.data));

    // Glowing halo ring around Ayodele
    honoreeNodes
      .append('circle')
      .attr('r', 20)
      .attr('fill', 'none')
      .attr('stroke', '#FFD700')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4 2')
      .attr('class', 'birthday-circle-pulse')
      .style('pointer-events', 'none');

    // Base circle
    node
      .append('circle')
      .attr('r', (d) => (isHonoree(d.data) ? 14 : 10))
      .attr('data-id', (d) => d.data.id)
      .attr('class', (d) =>
        isHonoree(d.data)
          ? 'node-circle birthday-circle-pulse'
          : 'node-circle'
      )
      .attr('style', (d) =>
        isHonoree(d.data) ? 'stroke: #FFD700; stroke-width: 3.5px; fill: #201700;' : ''
      );

    // Crown for Ayodele
    honoreeNodes
      .append('text')
      .attr('dy', '-1.2em')
      .attr('x', 0)
      .attr('text-anchor', 'middle')
      .attr('style', 'font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif; font-size: 20px;')
      .attr('class', 'crown-float select-none')
      .text('👑');

    node
      .append('text')
      .attr('dy', (d) => (isHonoree(d.data) ? '2.5em' : '2.2em'))
      .attr('x', 0)
      .attr('text-anchor', 'middle')
      .attr('class', (d) =>
        isHonoree(d.data)
          ? 'node-label font-bold text-xs'
          : 'node-label font-bold text-xs'
      )
      .attr('style', (d) =>
        isHonoree(d.data)
          ? 'fill: #FFD700; font-weight: bold; filter: drop-shadow(0 0 6px #FFD700);'
          : ''
      )
      .text((d) => d.data.name);

    honoreeNodes
      .append('text')
      .attr('dy', '4.0em')
      .attr('x', 0)
      .attr('text-anchor', 'middle')
      .attr('style', 'fill: #FFD700; font-size: 9px; font-weight: bold; letter-spacing: 0.15em;')
      .attr('class', 'select-none uppercase')
      .text('✨ Birthday Honoree ✨');

    node
      .append('text')
      .attr('dy', (d) => (isHonoree(d.data) ? '5.4em' : '3.6em'))
      .attr('x', 0)
      .attr('text-anchor', 'middle')
      .attr('class', 'node-year opacity-70')
      .text((d) => (d.data.birthYear ? `${d.data.birthYear} - ${d.data.deathYear || ''}` : ''));
  }, [data, dimensions, onNodeClick]);

  // Effect B: only update active node styling on change
  useEffect(() => {
    if (!gRef.current) return;
    const nodes = d3.select(gRef.current).selectAll('.node circle.node-circle');
    nodes.each(function () {
      const el = d3.select(this);
      const d = el.datum();
      if (!d || !d.data) return;
      const isBday = isHonoree(d.data);
      const isActive = d.data.id === activeNodeId;
      if (isBday) {
        el.attr(
          'style',
          `stroke: #FFD700; stroke-width: ${isActive ? '5px' : '3.5px'}; fill: #201700; filter: drop-shadow(0 0 ${
            isActive ? '24px' : '12px'
          } #FFD700);`
        );
      } else if (isActive) {
        el.attr(
          'style',
          'stroke: #D4AF37; stroke-width: 4px; filter: drop-shadow(0 0 15px rgba(212,175,55,1));'
        );
      } else {
        el.attr('style', '');
      }
    });
  }, [activeNodeId]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[650px] sm:h-[750px] relative overflow-hidden bg-black/50 border-t border-b border-gold/10 touch-none select-none"
      style={{ touchAction: 'none' }}
    >
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h3 className="text-gold font-serif text-xl tracking-widest">Lineage Landscape</h3>
        <p className="text-[10px] text-parchment/30 uppercase tracking-[0.2em] italic">
          Drag to explore • Pinch or use slider to zoom
        </p>
      </div>

      {/* Floating Navigation & Zoom Dock */}
      <div className="absolute bottom-6 right-4 sm:right-6 z-20 flex items-center gap-1.5 sm:gap-2 bg-black/85 backdrop-blur-md border border-gold/30 px-3 py-1.5 sm:py-2 rounded-full shadow-[0_0_25px_rgba(0,0,0,0.85)]">
        <button
          onClick={handleZoomOut}
          className="p-1.5 text-gold/80 hover:text-gold hover:bg-gold/10 rounded-full transition-colors active:scale-90 cursor-pointer"
          aria-label="Zoom Out"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>

        <div className="flex items-center gap-1.5 px-1">
          <input
            type="range"
            min="0.15"
            max="2.5"
            step="0.05"
            value={Math.min(2.5, Math.max(0.15, currentZoom))}
            onChange={handleZoomSlider}
            className="w-16 sm:w-28 accent-[#FFD700] cursor-pointer h-1.5 bg-gold/20 rounded-lg"
            aria-label="Zoom level"
          />
          <span className="text-[10px] text-gold/80 font-mono w-9 text-center hidden sm:inline-block select-none">
            {Math.round(currentZoom * 100)}%
          </span>
        </div>

        <button
          onClick={handleZoomIn}
          className="p-1.5 text-gold/80 hover:text-gold hover:bg-gold/10 rounded-full transition-colors active:scale-90 cursor-pointer"
          aria-label="Zoom In"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>

        <div className="h-4 w-px bg-gold/20 mx-0.5" />

        <button
          onClick={handleResetZoom}
          className="flex items-center gap-1 px-2.5 py-1 text-gold/90 hover:text-gold hover:bg-gold/10 rounded-full text-[10px] uppercase tracking-wider transition-colors active:scale-90 font-medium cursor-pointer"
          title="Reset View / Fit to Screen"
        >
          <Maximize2 size={12} />
          <span>Fit</span>
        </button>
      </div>

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="cursor-move touch-none"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};

export default FamilyTree;
