// Update the parent component (NetworkGraph.tsx)
import { useState, useEffect,useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize, Info, X } from "lucide-react";
import { NetworkChart, Node } from "@/components/NetworkChart";

export default function NetworkGraph() {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const graphContainerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));
  };

  const toggleFullscreen = async () => {
    if (!graphContainerRef.current) return;
    
    try {
      if (isFullScreen) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } else {
        if (graphContainerRef.current.requestFullscreen) {
          await graphContainerRef.current.requestFullscreen();
        }
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <MainLayout title="Network Graph">
      <div className="flex flex-col h-full p-4">
        {/* Top controls bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                className="rounded-lg"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-2 w-12 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                className="rounded-lg"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleFullscreen}
            >
              {isFullScreen ? (
                <Maximize className="h-4 w-4 rotate-45" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowInfo(!showInfo)}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main graph area */}
        <div className="flex-1 flex flex-col md:flex-row gap-4">
          {/* Graph visualization */}
          <div 
            ref={graphContainerRef}
            className={`${selectedNode ? "md:flex-1" : "md:flex-1"} border rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm relative graph-container`}
          >
            <NetworkChart
              zoomLevel={zoomLevel}
              onNodeSelect={setSelectedNode}
              selectedNode={selectedNode}
              showInfo={showInfo}
              isFullScreen={isFullScreen}
            />
          </div>

          {/* Node details panel */}
          {selectedNode && (
            <div className="w-full md:w-64 border rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Node Details</h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => setSelectedNode(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedNode.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selectedNode.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Connections</p>
                  <p className="font-medium">{selectedNode.connections || 0}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}