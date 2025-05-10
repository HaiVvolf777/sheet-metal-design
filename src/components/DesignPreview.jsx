import { useRef, useState, useEffect } from 'react'
// import * as htmlToImage from 'html-to-image'
// import { FaDownload } from 'react-icons/fa'
import { exportToDXF } from '../utils/exportUtils.js'

export default function DesignPreview({
  sheet,
  foldLines,
  selectedFoldLine,
  setSelectedFoldLine,
  updateFoldLine,
  saveDesign,
  loadDesign,
  deleteDesign,
  savedDesigns,
}) {
  const svgRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })

  // Handle dragging fold lines
  const handleMouseDown = (e, index) => {
    if (e.button !== 0) return
    setSelectedFoldLine(index)
    setDragging(true)
    setStartPos({ x: e.clientX, y: e.clientY })
    e.preventDefault()
  }

  const handleMouseMove = (e) => {
    if (!dragging || selectedFoldLine === null) return
    e.preventDefault()
    
    const line = foldLines[selectedFoldLine]
    const delta = line.direction === 'horizontal' 
      ? (e.clientY - startPos.y) / zoom 
      : (e.clientX - startPos.x) / zoom
    
    const maxPosition = line.direction === 'horizontal' ? sheet.height : sheet.width
    const newPosition = Math.min(Math.max(0, line.position + delta), maxPosition)
    
    updateFoldLine(selectedFoldLine, {
      ...line,
      position: newPosition
    })
    
    setStartPos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setDragging(false)
  }

  // Handle panning
  const handlePanStart = (e) => {
    if (e.button !== 0 || dragging) return
    e.preventDefault()
    setStartPos({ x: e.clientX, y: e.clientY })
  }

//   const handlePanMove = (e) => {
//     if (dragging) return
//     e.preventDefault()
    
//     setPan(prev => ({
//       x: prev.x + (e.clientX - startPos.x),
//       y: prev.y + (e.clientY - startPos.y)
//     }))
//     setStartPos({ x: e.clientX, y: e.clientY })
//   }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.min(Math.max(0.5, prev * delta), 3))
  }

  // Export as PNG
// Export as PNG - Fixed version
// Export as PNG - Final working version
const exportAsPng = async () => {
    prepareSvgForExport();
    if (!svgRef.current) return;
  
    try {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions (scaled up for better quality)
      const scale = 3; // Increase for higher quality
      canvas.width = sheet.width * scale;
      canvas.height = sheet.height * scale;
      
      // Fill background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Serialize SVG to XML
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const img = new Image();
      
      // Create blob URL for the SVG
      const svgBlob = new Blob([svgData], {type: 'image/svg+xml'});
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        // Draw the SVG onto canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to PNG
        const pngUrl = canvas.toDataURL('image/png');
        
        // Create download link
        const link = document.createElement('a');
        link.download = `sheet-metal-design-${Date.now()}.png`;
        link.href = pngUrl;
        link.click();
        
        // Clean up
        URL.revokeObjectURL(url);
      };
      
      img.onerror = (error) => {
        console.error('Error loading SVG:', error);
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Failed to export image. Please try again.');
    }
  };

  const exportAsDxf = () => {
    try {
      // Enhanced validation
      if (!sheet || typeof sheet.width !== 'number' || typeof sheet.height !== 'number') {
        throw new Error("Invalid sheet dimensions");
      }
  
      if (!Array.isArray(foldLines)) {
        throw new Error("Fold lines data is not valid");
      }
  
      // Filter out invalid fold lines
      const validFoldLines = foldLines.filter(line => 
        line && 
        typeof line.position === 'number' && 
        (line.direction === 'horizontal' || line.direction === 'vertical')
      );
  
      const dxfContent = exportToDXF(sheet, validFoldLines);
      
      // Create download with proper MIME type
      const blob = new Blob([dxfContent], { type: 'application/dxf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `sheet-metal-design-${Date.now()}.dxf`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      // Clean up after a delay to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("DXF Export Error:", error);
      alert(`Failed to export DXF: ${error.message}`);
    }
  };


  const prepareSvgForExport = () => {
    if (!svgRef.current) return;
    
    // Make all elements visible
    const elements = svgRef.current.querySelectorAll('*');
    elements.forEach(el => {
      el.style.visibility = 'visible';
      el.style.opacity = '1';
    });
    
    // Force show all bend direction indicators
    const polygons = svgRef.current.querySelectorAll('polygon');
    polygons.forEach(poly => {
      poly.style.visibility = 'visible';
    });
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (dragging) setDragging(false)
    }

    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [dragging])

  return (
    <div className="preview-container">
      <div className="preview-controls">
      <div className="storage-controls">
    <button onClick={() => saveDesign()}>
      Save Design
    </button>
    
    {savedDesigns.length > 0 && (
      <div className="saved-designs-dropdown">
        <select 
          onChange={(e) => loadDesign(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>Load Design</option>
          {savedDesigns.map(design => (
            <option key={design.name} value={design.name}>
              {design.name}
            </option>
          ))}
        </select>
        <button 
          onClick={() => deleteDesign(savedDesigns[0].name)}
          disabled={!savedDesigns.length}
        >
          Delete
        </button>
      </div>
    )}
  </div>
        <button onClick={exportAsPng}>
        Export as PNG
        </button>
        <button onClick={exportAsDxf}>
       Export as DXF
        </button>
        <div className="zoom-controls">
          <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}>-</button>
          <span>{(zoom * 100).toFixed(0)}%</span>
          <button onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}>+</button>
          <button onClick={() => {
            setZoom(1)
            setPan({ x: 0, y: 0 })
          }}>Reset</button>
        </div>
      </div>
      <div 
        className="svg-container"
        onMouseDown={handlePanStart}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <div 
          className="svg-wrapper"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            cursor: dragging ? 'grabbing' : 'grab',
            backgroundColor: 'transparent',
            willChange: 'transform'
          }}
        >
          <svg
            ref={svgRef}
            width={sheet.width}
            height={sheet.height}
            viewBox={`0 0 ${sheet.width} ${sheet.height}`}
            xmlns="http://www.w3.org/2000/svg"
            style={{ 
              backgroundColor: 'white',
              display: 'block'
            }}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Sheet */}
            <rect
              x="0"
              y="0"
              width={sheet.width}
              height={sheet.height}
              fill="white"
              stroke="#333"
              strokeWidth="1"
            />
            
            {/* Fold lines */}
            {foldLines.map((line, index) => {
              const isSelected = index === selectedFoldLine
              const strokeColor = isSelected ? '#ff5722' : '#3f51b5'
              const strokeWidth = isSelected ? 3 : 2
              
              if (line.direction === 'horizontal') {
                return (
                  <g 
                    key={line.id}
                    onMouseDown={(e) => handleMouseDown(e, index)}
                    style={{ cursor: 'move' }}
                  >
                    <line
                      x1="0"
                      y1={line.position}
                      x2={sheet.width}
                      y2={line.position}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={isSelected ? '0' : '5,5'}
                    />
                    {/* Bend direction indicator */}
                    <polygon
                      points={`
                        ${sheet.width - 15},${line.position - 5}
                        ${sheet.width - 5},${line.position}
                        ${sheet.width - 15},${line.position + 5}
                      `}
                      fill={strokeColor}
                      visibility={line.bendDirection === 'up' ? 'visible' : 'hidden'}
                    />
                    <polygon
                      points={`
                        ${15},${line.position - 5}
                        ${5},${line.position}
                        ${15},${line.position + 5}
                      `}
                      fill={strokeColor}
                      visibility={line.bendDirection === 'down' ? 'visible' : 'hidden'}
                    />
                  </g>
                )
              } else {
                return (
                  <g 
                    key={line.id}
                    onMouseDown={(e) => handleMouseDown(e, index)}
                    style={{ cursor: 'move' }}
                  >
                    <line
                      x1={line.position}
                      y1="0"
                      x2={line.position}
                      y2={sheet.height}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={isSelected ? '0' : '5,5'}
                    />
                    {/* Bend direction indicator */}
                    <polygon
                      points={`
                        ${line.position - 5},15
                        ${line.position},5
                        ${line.position + 5},15
                      `}
                      fill={strokeColor}
                      visibility={line.bendDirection === 'left' ? 'visible' : 'hidden'}
                    />
                    <polygon
                      points={`
                        ${line.position - 5},${sheet.height - 15}
                        ${line.position},${sheet.height - 5}
                        ${line.position + 5},${sheet.height - 15}
                      `}
                      fill={strokeColor}
                      visibility={line.bendDirection === 'right' ? 'visible' : 'hidden'}
                    />
                  </g>
                )
              }
            })}
          </svg>
        </div>
      </div>
    </div>
  )
}