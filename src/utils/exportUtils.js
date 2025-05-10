export function exportToDXF(sheet = {}, foldLines = []) {
    // Validate inputs with stricter checks
    if (typeof sheet !== 'object' || !sheet.width || !sheet.height) {
      console.error("Invalid sheet dimensions", sheet);
      return "";
    }
  
    if (!Array.isArray(foldLines)) {
      console.error("foldLines must be an array", foldLines);
      foldLines = [];
    }
  
    // DXF header with units specification (millimeters)
    let dxfString = `0\nSECTION\n2\nHEADER\n9\n$INSUNITS\n70\n4\n0\nENDSEC\n`;
    dxfString += `0\nSECTION\n2\nTABLES\n0\nENDSEC\n`;
    dxfString += `0\nSECTION\n2\nBLOCKS\n0\nENDSEC\n`;
    dxfString += `0\nSECTION\n2\nENTITIES\n`;
  
    // Add sheet rectangle as LWPOLYLINE (more modern than POLYLINE)
    dxfString += `0\nLWPOLYLINE\n8\n0\n90\n4\n70\n1\n`;
    dxfString += `10\n0\n20\n0\n`; // Point 1
    dxfString += `10\n${sheet.width}\n20\n0\n`; // Point 2
    dxfString += `10\n${sheet.width}\n20\n${sheet.height}\n`; // Point 3
    dxfString += `10\n0\n20\n${sheet.height}\n`; // Point 4 (closes rectangle)
  
    // Add fold lines with enhanced precision
    foldLines.forEach((line) => {
      if (!line || typeof line.position !== 'number') {
        console.warn("Skipping invalid fold line:", line);
        return;
      }
  
      if (line.direction === 'horizontal') {
        dxfString += `0\nLINE\n8\n0\n`;
        dxfString += `10\n0\n20\n${line.position.toFixed(4)}\n30\n0\n`;
        dxfString += `11\n${sheet.width}\n21\n${line.position.toFixed(4)}\n31\n0\n`;
      } else if (line.direction === 'vertical') {
        dxfString += `0\nLINE\n8\n0\n`;
        dxfString += `10\n${line.position.toFixed(4)}\n20\n0\n30\n0\n`;
        dxfString += `11\n${line.position.toFixed(4)}\n21\n${sheet.height}\n31\n0\n`;
      }
    });
  
    dxfString += `0\nENDSEC\n0\nEOF`;
    
    return dxfString;
  }