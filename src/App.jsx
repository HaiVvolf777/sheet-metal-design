import { useState, useEffect } from 'react';
import SheetControls from './components/SheetControls';
import FoldLineControls from './components/FoldLineControls';
import DesignPreview from './components/DesignPreview';
import './App.css';

function App() {
  const [sheet, setSheet] = useState({
    width: 300,
    height: 200,
    unit: 'mm'
  });
  const [foldLines, setFoldLines] = useState([]);
  const [selectedFoldLine, setSelectedFoldLine] = useState(null);
  const [savedDesigns, setSavedDesigns] = useState([]);

  // Load saved designs on component mount
  useEffect(() => {
    try {
      const designsJSON = localStorage.getItem('sheetMetalDesigns');
      const designs = designsJSON ? JSON.parse(designsJSON) : [];
      setSavedDesigns(Array.isArray(designs) ? designs : []);
    } catch (error) {
      console.error('Error loading designs:', error);
      setSavedDesigns([]);
    }
  }, []);

  // Save current design to localStorage
  const saveDesign = (designName = `Design ${new Date().toLocaleString()}`) => {
    const name = prompt('Enter a name for this design:', designName);
    if (!name || !name.trim()) return;

    const design = {
      name: name.trim(),
      sheet,
      foldLines,
      timestamp: new Date().toISOString()
    };

    try {
      // Safely get and parse existing designs
      let designs = [];
      try {
        const designsJSON = localStorage.getItem('sheetMetalDesigns');
        designs = designsJSON ? JSON.parse(designsJSON) : [];
        if (!Array.isArray(designs)) {
          designs = [];
        }
      } catch {
        designs = [];
      }

      const existingIndex = designs.findIndex(d => d.name === design.name);
      
      if (existingIndex >= 0) {
        designs[existingIndex] = design; // Update existing
      } else {
        designs.push(design); // Add new
      }

      localStorage.setItem('sheetMetalDesigns', JSON.stringify(designs));
      setSavedDesigns(designs);
      alert(`Design "${design.name}" saved successfully!`);
    } catch (error) {
      console.error('Error saving design:', error);
      alert('Failed to save design. Local storage may be full or data corrupted.');
    }
  };

  // Load design from localStorage
  const loadDesign = (designName) => {
    try {
      const designsJSON = localStorage.getItem('sheetMetalDesigns');
      const designs = designsJSON ? JSON.parse(designsJSON) : [];
      
      if (!Array.isArray(designs)) {
        throw new Error('Invalid designs format');
      }

      const design = designs.find(d => d.name === designName);
      
      if (design) {
        // Validate loaded design structure
        if (!design.sheet || !design.foldLines) {
          throw new Error('Invalid design structure');
        }
        
        setSheet(design.sheet);
        setFoldLines(design.foldLines);
        setSelectedFoldLine(null);
        alert(`Design "${design.name}" loaded successfully!`);
      } else {
        alert('Design not found');
      }
    } catch (error) {
      console.error('Error loading design:', error);
      alert('Failed to load design. Data may be corrupted.');
    }
  };

  // Delete design from localStorage
  const deleteDesign = (designName) => {
    if (!window.confirm(`Delete design "${designName}"?`)) return;

    try {
      const designsJSON = localStorage.getItem('sheetMetalDesigns');
      const designs = designsJSON ? JSON.parse(designsJSON) : [];
      
      if (!Array.isArray(designs)) {
        throw new Error('Invalid designs format');
      }

      const updatedDesigns = designs.filter(d => d.name !== designName);
      localStorage.setItem('sheetMetalDesigns', JSON.stringify(updatedDesigns));
      setSavedDesigns(updatedDesigns);
      alert('Design deleted');
    } catch (error) {
      console.error('Error deleting design:', error);
      alert('Failed to delete design');
    }
  };

  // Existing functions
  const addFoldLine = (line) => {
    setFoldLines([...foldLines, line]);
  };

  const removeFoldLine = (index) => {
    setFoldLines(foldLines.filter((_, i) => i !== index));
  };

  const updateFoldLine = (index, updatedLine) => {
    setFoldLines(foldLines.map((line, i) => i === index ? updatedLine : line));
  };

  return (
    <div className="app">
      <h1>Sheet Metal Design Preview</h1>
      <div className="controls-container">
        <SheetControls sheet={sheet} setSheet={setSheet} />
        <FoldLineControls 
          sheet={sheet}
          foldLines={foldLines}
          addFoldLine={addFoldLine}
          removeFoldLine={removeFoldLine}
          selectedFoldLine={selectedFoldLine}
          setSelectedFoldLine={setSelectedFoldLine}
        />
      </div>
      <DesignPreview 
        sheet={sheet} 
        foldLines={foldLines}
        selectedFoldLine={selectedFoldLine}
        setSelectedFoldLine={setSelectedFoldLine}
        updateFoldLine={updateFoldLine}
        saveDesign={saveDesign}
        loadDesign={loadDesign}
        deleteDesign={deleteDesign}
        savedDesigns={savedDesigns}
      />
    </div>
  );
}

export default App;