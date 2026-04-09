import React, { useState, useEffect } from 'react';
import DataStore from '../utils/DataStore';

const FinancePage = () => {
    const [drivers, setDrivers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [selectedDriver, setSelectedDriver] = useState('');
    const [form, setForm] = useState({ type: 'Advance', amount: 0, remark: '' });

    useEffect(() => {
        setDrivers(DataStore.getDrivers());
        setTransactions(DataStore.getFinances());
    }, []);

    const handleTransaction = () => {
        if(!selectedDriver) return alert("Select Driver");
        if(form.amount <= 0) return alert("Enter valid amount");

        const driver = drivers.find(d => d.id == selectedDriver);
        
        DataStore.saveFinance({
            ...form,
            driverId: selectedDriver,
            driverName: driver.name,
            date: new Date().toLocaleString(),
            amount: parseFloat(form.amount)
        });

        setTransactions(DataStore.getFinances());
        setForm({ type: 'Advance', amount: 0, remark: '' });
        alert('Transaction Recorded');
    };

    // Calculate Totals for Selected Driver
    const getDriverStats = () => {
        const driverTxns = transactions.filter(t => t.driverId == selectedDriver);
        let advance = 0, bhatta = 0, fine = 0, salary = 0, expense = 0;

        driverTxns.forEach(t => {
            if(t.type === 'Advance') advance += t.amount;
            if(t.type === 'Bhatta') bhatta += t.amount;
            if(t.type === 'Fine') fine += t.amount;
            if(t.type === 'Salary') salary += t.amount;
            if(t.type === 'Expense') expense += t.amount;
        });

        const totalCredit = salary + bhatta;
        const totalDebit = advance + fine + expense;
        const balance = totalCredit - totalDebit;

        return { advance, bhatta, fine, salary, expense, balance };
    };

    const stats = getDriverStats();

    const doSettlement = () => {
        if(!selectedDriver) return;
        const driver = drivers.find(d => d.id == selectedDriver);
        if(window.confirm(`Mark Full & Final Settlement for ${driver.name}? Balance: ₹${stats.balance}`)) {
            DataStore.saveFinance({
                type: 'Settlement',
                driverId: selectedDriver,
                driverName: driver.name,
                amount: stats.balance,
                remark: 'Full & Final Settlement',
                date: new Date().toLocaleString()
            });
            setTransactions(DataStore.getFinances());
            alert('Settlement Completed');
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Finance & Driver Settlement</h2>

            <div style={{ display: 'flex', gap: 20 }}>
                {/* Left: Form & Stats */}
                <div style={{ flex: 1 }}>
                    <div style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 20 }}>
                        <h4>Record Transaction</h4>
                        <select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)} style={inputStyle}>
                            <option value="">Select Driver</option>
                            {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>

                        {selectedDriver && (
                            <>
                                {/* Summary Cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, margin: '15px 0', textAlign: 'center' }}>
                                    <div style={statMini}><h4>₹{stats.salary}</h4><small>Salary</small></div>
                                    <div style={statMini}><h4>₹{stats.advance}</h4><small>Advance</small></div>
                                    <div style={statMini}><h4>₹{stats.bhatta}</h4><small>Bhatta</small></div>
                                    <div style={{...statMini, background: '#ffebee'}}><h4>₹{stats.fine}</h4><small>Fines</small></div>
                                    <div style={{...statMini, background: '#e3f2fd'}}><h4>₹{stats.expense}</h4><small>Expense</small></div>
                                    <div style={{...statMini, background: stats.balance >= 0 ? '#e8f5e9' : '#fff3e0'}}>
                                        <h4>₹{stats.balance}</h4><small>Balance</small>
                                    </div>
                                </div>

                                <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} style={inputStyle}>
                                    <option value="Advance">Advance (Debit)</option>
                                    <option value="Bhatta">Bhatta / Allowance (Credit)</option>
                                    <option value="Fine">Fine / Penalty (Debit)</option>
                                    <option value="Salary">Salary (Credit)</option>
                                    <option value="Expense">Other Expense (Debit)</option>
                                </select>

                                <input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} style={inputStyle} />
                                <input placeholder="Remark (e.g., Trip #101)" value={form.remark} onChange={(e) => setForm({...form, remark: e.target.value})} style={inputStyle} />
                                
                                <button onClick={handleTransaction} style={btnPrimary}>Add Transaction</button>
                                <button onClick={doSettlement} style={{...btnPrimary, background: '#e74c3c', marginTop: 5}}>Full & Final Settlement</button>
                            </>
                        )}
                    </div>
                </div>

                {/* Right: Ledger */}
                <div style={{ flex: 2, background: '#fff', padding: 20, borderRadius: 8 }}>
                    <h4>Transaction Ledger</h4>
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={th}>Date</th>
                                <th style={th}>Driver</th>
                                <th style={th}>Type</th>
                                <th style={th}>Remark</th>
                                <th style={th}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(t => (
                                <tr key={t.id}>
                                    <td style={td}>{t.date}</td>
                                    <td style={td}>{t.driverName}</td>
                                    <td style={td}><span style={typeBadge(t.type)}>{t.type}</span></td>
                                    <td style={td}>{t.remark}</td>
                                    <td style={{...td, textAlign: 'right', fontWeight: 'bold', color: (t.type === 'Salary' || t.type === 'Bhatta') ? 'green' : 'red'}}>
                                        { (t.type === 'Salary' || t.type === 'Bhatta') ? '+' : '-'} ₹{t.amount}
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

const inputStyle = { width: '100%', padding: 10, margin: '5px 0', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' };
const btnPrimary = { width: '100%', padding: 12, background: '#1abc9c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', marginTop: 10 };
const th = { textAlign: 'left', padding: 10, borderBottom: '2px solid #eee' };
const td = { padding: 10, borderBottom: '1px solid #eee' };
const statMini = { background: '#f9f9f9', padding: 10, borderRadius: 4, border: '1px solid #eee' };
const typeBadge = (type) => ({ padding: '3px 8px', borderRadius: 10, fontSize: 11, background: type === 'Salary' ? '#e8f8f5' : type === 'Fine' ? '#ffebee' : '#fff3cd' });

export default FinancePage;