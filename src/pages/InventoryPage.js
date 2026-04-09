import React, { useState, useEffect } from 'react';
import DataStore from '../utils/DataStore';

const InventoryPage = () => {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState({ name: '', qty: 0, reorder: 5 });
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        setItems(DataStore.getInventory());
    }, []);

    const saveItem = () => {
        DataStore.saveInventory(form);
        setItems(DataStore.getInventory());
        setForm({ name: '', qty: 0, reorder: 5 });
    };

    const updateItem = () => {
        DataStore.updateInventory(editingItem);
        setItems(DataStore.getInventory());
        setEditingItem(null);
    };

    const lowStockItems = items.filter(i => i.qty <= i.reorder);

    return (
        <div style={{ padding: 20 }}>
            <h2>Inventory Management</h2>

            {/* Low Stock Alert Bar */}
            {lowStockItems.length > 0 && (
                <div style={{ background: '#ffdede', padding: 15, marginBottom: 20, borderLeft: '5px solid red', borderRadius: 4 }}>
                    <strong>⚠️ Low Stock Alert ({lowStockItems.length} items):</strong>
                    <span style={{ marginLeft: 10 }}>{lowStockItems.map(i => i.name).join(', ')}</span>
                </div>
            )}

            <div style={{ display: 'flex', gap: 20 }}>
                {/* Add/Edit Form */}
                <div style={{ flex: 1, background: '#fff', padding: 20, borderRadius: 8, height: 'fit-content' }}>
                    <h4>{editingItem ? 'Edit Item' : 'Add New Item'}</h4>
                    <input placeholder="Item Name" value={editingItem ? editingItem.name : form.name} 
                        onChange={e => editingItem ? setEditingItem({...editingItem, name: e.target.value}) : setForm({...form, name: e.target.value})} 
                        style={inputStyle} />
                    <input placeholder="Quantity" type="number" value={editingItem ? editingItem.qty : form.qty}
                        onChange={e => editingItem ? setEditingItem({...editingItem, qty: parseInt(e.target.value)}) : setForm({...form, qty: parseInt(e.target.value)})} 
                        style={inputStyle} />
                    <input placeholder="Reorder Level" type="number" value={editingItem ? editingItem.reorder : form.reorder}
                        onChange={e => editingItem ? setEditingItem({...editingItem, reorder: parseInt(e.target.value)}) : setForm({...form, reorder: parseInt(e.target.value)})} 
                        style={inputStyle} />
                    
                    {editingItem ? (
                        <button onClick={updateItem} style={{...btnStyle, background: '#f39c12'}}>Update Item</button>
                    ) : (
                        <button onClick={saveItem} style={btnStyle}>Add Item</button>
                    )}
                </div>

                {/* List */}
                <div style={{ flex: 3, background: '#fff', padding: 20, borderRadius: 8 }}>
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr><th style={thStyle}>Name</th><th style={thStyle}>Qty</th><th style={thStyle}>Status</th><th style={thStyle}>Action</th></tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id}>
                                    <td style={tdStyle}>{item.name}</td>
                                    <td style={tdStyle}>{item.qty}</td>
                                    <td style={tdStyle}>
                                        {item.qty <= item.reorder ? <span style={{color: 'red', fontWeight: 'bold'}}>Order Now</span> : <span style={{color: 'green'}}>In Stock</span>}
                                    </td>
                                    <td style={tdStyle}>
                                        <button onClick={() => setEditingItem(item)} style={sBtn}>Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
const inputStyle = { width: '100%', padding: 8, margin: '5px 0', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: 10, background: '#1abc9c', color: '#fff', border: 'none', borderRadius: 4, marginTop: 10 };
const thStyle = { textAlign: 'left', borderBottom: '2px solid #eee', padding: 10 };
const tdStyle = { padding: 10, borderBottom: '1px solid #eee' };
const sBtn = { padding: '5px 10px', background: '#3498db', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' };
export default InventoryPage;