import { useState } from "react";

export default function FoldLineControls({
  sheet,
  foldLines,
  addFoldLine,
  removeFoldLine,
  selectedFoldLine,
  setSelectedFoldLine,
}) {
  const [newLine, setNewLine] = useState({
    position: 0,
    direction: "horizontal",
    bendDirection: "up",
  });

  const handleAddLine = () => {
    addFoldLine({
      ...newLine,
      id: Date.now(),
      position: Math.min(
        Math.max(0, newLine.position),
        newLine.direction === "horizontal" ? sheet.height : sheet.width
      ),
    });
    setNewLine({
      position: 0,
      direction: "horizontal",
      bendDirection: "up",
    });
  };

  return (
    <div className="control-panel">
      <h2>Fold Lines</h2>
      <div className="input-group">
        <label>
          Direction:
          <select
            value={newLine.direction}
            onChange={(e) =>
              setNewLine({ ...newLine, direction: e.target.value })
            }
          >
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
        </label>
      </div>
      <div className="input-group">
        <label>
          Position (mm):
          <input
            type="number"
            value={newLine.position}
            onChange={(e) =>
              setNewLine({
                ...newLine,
                position: parseInt(e.target.value) || 0,
              })
            }
            min="0"
            max={
              newLine.direction === "horizontal" ? sheet.height : sheet.width
            }
          />
        </label>
      </div>
      <div className="input-group">
        <label>
          Bend Direction:
          <select
            value={newLine.bendDirection}
            onChange={(e) =>
              setNewLine({ ...newLine, bendDirection: e.target.value })
            }
          >
            <option value="up">Up</option>
            <option value="down">Down</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </label>
      </div>
      <button onClick={handleAddLine}>Add Fold Line</button>

      <div className="fold-line-list">
        <h3>Current Fold Lines</h3>
        {foldLines.length === 0 ? (
          <p>No fold lines added</p>
        ) : (
          <ul>
            {foldLines.map((line, index) => (
              <li
                key={line.id}
                className={selectedFoldLine === index ? "selected" : ""}
                onClick={() => setSelectedFoldLine(index)}
              >
                {line.direction} at {line.position}mm ({line.bendDirection})
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFoldLine(index);
                    if (selectedFoldLine === index) {
                      setSelectedFoldLine(null);
                    }
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
