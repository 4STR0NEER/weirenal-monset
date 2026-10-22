import { useState } from 'react'
import { getInventory, useLoad } from '../api.js'

const CATEGORIES = ['Dialyzers', 'Bloodlines', 'Needles', 'Concentrates', 'Medicines', 'PD Supplies', 'Supplies']

export default function Inventory() {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const { data: items, loading } = useLoad(() => getInventory({ q, category }), [q, category])

  return (
    <>
      <header className="page-head">
        <h1>Inventory lookup</h1>
        <p className="muted">Search by item name or SKU.</p>
      </header>

      <div className="filters">
        <input type="search" placeholder="e.g. dialyzer, MED-EPO" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search inventory" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <section className="card">
        {loading && !items ? <p className="muted">Loading…</p> : items.length === 0 ? <p className="muted">No items match.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>SKU</th><th>Item</th><th>Category</th><th>In stock</th><th>Reorder at</th><th>Expiry</th></tr></thead>
              <tbody>
                {items.map((i) => {
                  const low = i.stock <= i.reorderAt
                  return (
                    <tr key={i.sku}>
                      <td className="mono">{i.sku}</td>
                      <td>{i.name}</td>
                      <td>{i.category}</td>
                      <td className={low ? 'warn' : ''}>{i.stock} {i.unit}{low && <span className="pill low">Low</span>}</td>
                      <td>{i.reorderAt}</td>
                      <td>{i.expiry}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}
