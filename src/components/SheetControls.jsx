export default function SheetControls({ sheet, setSheet }) {
    const handleChange = (e) => {
      const { name, value } = e.target
      setSheet({
        ...sheet,
        [name]: Math.max(10, parseInt(value) || 0) // Minimum 10mm
      })
    }
  
    return (
      <div className="control-panel">
        <h2>Sheet Dimensions</h2>
        <div className="input-group">
          <label>
            Width (mm):
            <input
              type="number"
              name="width"
              value={sheet.width}
              onChange={handleChange}
              min="10"
            />
          </label>
        </div>
        <div className="input-group">
          <label>
            Height (mm):
            <input
              type="number"
              name="height"
              value={sheet.height}
              onChange={handleChange}
              min="10"
            />
          </label>
        </div>
      </div>
    )
  }