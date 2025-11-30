import React, { useEffect, useRef, useState } from "react";
import { getUsersGraph } from "@/services/user/userService";
import * as d3 from "d3";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Spinner from "./ui/spinner";

export interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  profilePictureUrl: string | null;
  depth: number;
  connections: number;
  type: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  type: string;
}

interface NetworkChartProps {
  zoomLevel: number;
  onNodeSelect: (node: Node | null) => void;
  onNodeDetails?: (type: string, connections: number) => void;
  selectedNode: Node | null;
  showInfo?: boolean;
  isFullScreen?: boolean;
}

const NODE_COLORS = {
  core: "#6366f1",
  hub: "#8b5cf6",
  edge: "#ec4899",
};

export const NetworkChart: React.FC<NetworkChartProps> = ({
  zoomLevel,
  onNodeSelect,
  onNodeDetails,
  selectedNode,
  showInfo = false,
  isFullScreen = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<{ nodes: Node[]; links: Link[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulation, setSimulation] = useState<d3.Simulation<Node, Link> | null>(null);
  const [localZoom, setLocalZoom] = useState(1);
  const [containerHeight, setContainerHeight] = useState("70vh");

  // Handle fullscreen change
  useEffect(() => {
    if (isFullScreen) {
      setContainerHeight("100vh");
    } else {
      setContainerHeight("70vh");
    }
  }, [isFullScreen]);

  // Handle double click for fullscreen toggle
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleDblClick = () => {
      const elem = container.parentElement;
      if (!elem) return;
      
      try {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          elem.requestFullscreen().catch(err => {
            console.error("Fullscreen error:", err);
          });
        }
      } catch (err) {
        console.error("Fullscreen error:", err);
      }
    };

    container.addEventListener('dblclick', handleDblClick);
    return () => {
      container.removeEventListener('dblclick', handleDblClick);
    };
  }, []);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const graphData = await getUsersGraph();
      // Calculate connections count for each node
      const nodesWithConnections = graphData.nodes.map((node) => ({
        ...node,
        connections: graphData.links.filter(
          (l) =>
            (typeof l.source === "object" ? l.source.id : l.source) ===
              node.id ||
            (typeof l.target === "object" ? l.target.id : l.target) === node.id
        ).length,
        type: ["core", "hub", "edge"][node.depth] || "edge", // Assign type based on depth
      }));

      setData({
        nodes: nodesWithConnections,
        links: graphData.links,
      });
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load network data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle node selection
  const handleNodeSelect = (node: Node | null) => {
    onNodeSelect(node);
    if (onNodeDetails) {
      if (node) {
        onNodeDetails(node.type, node.connections);
      } else {
        onNodeDetails("", 0);
      }
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Render graph
  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    const { nodes, links } = data;
    const { clientWidth: width, clientHeight: height } = containerRef.current;
    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .classed("dark:text-white text-black", true);

    svg.selectAll("*").remove();

    const getNodeSize = (node: Node) => {
      // Predefined sizes for expected depths
      const sizeMap: Record<number, number> = {
        0: 40,
        1: 22,
        2: 16,
        3: 12,
      };

      return sizeMap[node.depth] ?? Math.max(8, 12 - (node.depth - 3) * 2);
    };

    // Color scale based on node type (from depth)
    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(["core", "hub", "edge"])
      .range([NODE_COLORS.core, NODE_COLORS.hub, NODE_COLORS.edge]);

    // Create zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        setLocalZoom(event.transform.k);
        chart.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Create chart group that will be transformed
    const chart = svg
      .append("g")
      .attr("transform", `scale(${zoomLevel * localZoom})`);

    // Link generator
    const linkGen = d3
      .linkHorizontal<any, any>()
      .source((d) => [d.source.x, d.source.y])
      .target((d) => [d.target.x, d.target.y]);

    // Simulation
    const sim = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => (d as Node).id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3.forceCollide().radius((d) => getNodeSize(d as Node) + 5)
      );

    setSimulation(sim);

    // Draw links
    const linkSel = chart
      .append("g")
      .selectAll("path")
      .data(links)
      .enter()
      .append("path")
      .attr("stroke", "#bbb")
      .attr("fill", "none")
      .attr("stroke-width", 1.5);

    // Nodes
    const nodeG = chart
      .append("g")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node cursor-pointer")
      .on("click", (e, d) => {
        e.stopPropagation();
        handleNodeSelect(d);
      })
      .call(
        d3
          .drag<SVGGElement, Node>()
          .on("start", (e, d) => {
            if (!e.active) sim.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (e, d) => {
            d.fx = e.x;
            d.fy = e.y;
          })
          .on("end", (e, d) => {
            if (!e.active) sim.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // ClipPaths and Images
    nodeG
      .append("clipPath")
      .attr("id", (d) => `clip-${d.id}`)
      .append("circle")
      .attr("r", getNodeSize);

    nodeG
      .append("circle")
      .attr("r", (d) => getNodeSize(d) + (selectedNode?.id === d.id ? 4 : 0))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("fill", (d) => colorScale(d.type));

    nodeG
      .append("image")
      .attr("xlink:href", (d) => d.profilePictureUrl || "")
      .attr("clip-path", (d) => `url(#clip-${d.id})`)
      .attr("x", (d) => -getNodeSize(d))
      .attr("y", (d) => -getNodeSize(d))
      .attr("width", (d) => getNodeSize(d) * 2)
      .attr("height", (d) => getNodeSize(d) * 2);

    // Labels
    const labels = chart
      .append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .text((d) => d.name)
      .attr("text-anchor", "middle")
      .attr("dy", (d) => -getNodeSize(d) - 6)
      .attr("font-size", 11)
      .attr("fill", "currentColor");

    // Tick
    sim.on("tick", () => {
      linkSel.attr("d", (d) => linkGen(d as any) as string);
      nodeG.attr("transform", (d) => `translate(${d.x},${d.y})`);
      labels.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
    });

    // Deselect on background click
    svg.on("click", () => handleNodeSelect(null));

    return () => sim.stop();
  }, [data, zoomLevel, selectedNode, localZoom]);

  // Resize handler
  useEffect(() => {
    const onResize = () => {
      if (!simulation || !containerRef.current) return;
      simulation.force(
        "center",
        d3.forceCenter(
          containerRef.current.clientWidth / 2,
          containerRef.current.clientHeight / 2
        )
      );
      simulation.alpha(0.3).restart();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [simulation]);

  if (loading)
    return (
      <div className="w-full h-full rounded-lg overflow-hidden flex justify-center item-center">
        <Spinner />
      </div>
    );

  if (error)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={fetchData}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );

  if (!data)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Alert>
          <AlertTitle>No Data Available</AlertTitle>
          <AlertDescription>
            No network data loaded.
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={fetchData}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );

    return (
      <div 
        ref={containerRef} 
        className="w-full relative"
        style={{ height: containerHeight }}
      >
        <svg
          ref={svgRef}
          className="w-full h-full bg-white dark:bg-gray-900 rounded-lg"
        />
        {showInfo && data && (
          <div className="absolute bottom-4 left-4 bg-background p-3 rounded-lg shadow-sm border">
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Nodes</p>
                <p className="font-semibold">{data.nodes.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Connections</p>
                <p className="font-semibold">{data.links.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
};
