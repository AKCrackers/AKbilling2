const express = require('express');
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, 'billing.sqlite'));
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Crackers',
    sku TEXT NOT NULL UNIQUE,
    price REAL NOT NULL CHECK(price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
    reorder_level INTEGER NOT NULL DEFAULT 10 CHECK(reorder_level >= 0),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT DEFAULT '',
    subtotal REAL NOT NULL,
    discount REAL NOT NULL DEFAULT 0,
    tax REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS bill_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    price REAL NOT NULL,
    line_total REAL NOT NULL
  );
`);
const seedProducts = [
  ['Flower Pots', 'Ground Spinners', 'FP-001', 120, 36, 10],
  ['Sparklers 12 inch', 'Sparklers', 'SP-012', 80, 64, 15],
  ['1000 Wala', 'Sound Crackers', 'SW-1000', 450, 18, 8],
  ['Chakra Deluxe', 'Ground Spinners', 'CH-002', 160, 27, 10],
  ['Color Smoke', 'Special Effects', 'CS-003', 220, 9, 10],
  ['Rocket Pack', 'Aerial', 'RK-005', 300, 22, 8]
];
const pdfProducts = [
  ['4 inch Gold Lakshmi', 'Ground Crackers', 'PDF-001', 35],
  ['Two Sound Crackers', 'Sound Crackers', 'PDF-002', 42],
  ['Red Bijili', 'Bijili', 'PDF-003', 36],
  ['Striped Bijili', 'Bijili', 'PDF-004', 40],
  ['28 Giant', 'Sound Crackers', 'PDF-005', 28],
  ['56 Giant', 'Sound Crackers', 'PDF-006', 58],
  ['Varma 0.1', 'Sound Crackers', 'PDF-007', 45],
  ['Varma 1', 'Sound Crackers', 'PDF-008', 280],
  ['Varma 2', 'Sound Crackers', 'PDF-009', 560],
  ['Varma 3', 'Sound Crackers', 'PDF-010', 1350],
  ['Varma 10', 'Sound Crackers', 'PDF-011', 2650],
  ['Flower Pot Basic Big', 'Ground Spinners', 'PDF-012', 72],
  ['Flower Pot Special', 'Ground Spinners', 'PDF-013', 95],
  ['Flower Pot Colour Koti Deluxe', 'Ground Spinners', 'PDF-014', 380],
  ['Tri Colour', 'Ground Spinners', 'PDF-015', 320],
  ['Ground Chakkar Basic Big', 'Ground Spinners', 'PDF-016', 50],
  ['Ground Chakkar Special', 'Ground Spinners', 'PDF-017', 86],
  ['Ground Chakkar Deluxe', 'Ground Spinners', 'PDF-018', 160],
  ['Ground Chakkar Spinner', 'Ground Spinners', 'PDF-019', 180],
  ['Ground Chakkar Spinner Deluxe', 'Ground Spinners', 'PDF-020', 220],
  ['Wire Chakkaram', 'Ground Spinners', 'PDF-021', 190],
  ['11/2 inch Twinkling Star', 'Sparklers', 'PDF-022', 25],
  ['4 inch Twinkling Star', 'Sparklers', 'PDF-023', 68],
  ['Rocket Bomb', 'Rockets', 'PDF-024', 65],
  ['Whistle Rocket', 'Rockets', 'PDF-025', 120],
  ['2 Sound or 3 Sound Rocket', 'Rockets', 'PDF-026', 130],
  ['Bullet Bomb', 'Sound Crackers', 'PDF-027', 30],
  ['1/4KG Paper Bomb', 'Sound Crackers', 'PDF-028', 60],
  ['1/4KG Paper Bomb Box', 'Sound Crackers', 'PDF-029', 120],
  ['Money Bank 2pcs', 'Special Crackers', 'PDF-030', 220],
  ['Mini Siren 5pcs', 'Sound Crackers', 'PDF-031', 175],
  ['Mega Siren 2pcs', 'Sound Crackers', 'PDF-032', 190],
  ['3 Way Peacock', 'Aerial', 'PDF-033', 175],
  ['Sun Drop', 'Aerial', 'PDF-034', 110],
  ['Cocktail Tin 2pcs', 'Aerial', 'PDF-035', 210],
  ['Elephant', 'Sound Crackers', 'PDF-036', 220],
  ['Dancing Butterfly', 'Aerial', 'PDF-037', 120],
  ['Photo Flash', 'Special Effects', 'PDF-038', 85],
  ['4x4 Wheel', 'Ground Spinners', 'PDF-039', 210],
  ['Crackling Fountain', 'Fountains', 'PDF-040', 380],
  ['Fish Fountain', 'Fountains', 'PDF-041', 180],
  ['Sword', 'Ground Spinners', 'PDF-042', 170],
  ['Rotating Sparklers', 'Sparklers', 'PDF-043', 270],
  ['Bat and Ball', 'Ground Spinners', 'PDF-044', 270],
  ['Colourful Smoke', 'Special Effects', 'PDF-045', 180],
  ['10 in 1 Flash', 'Special Effects', 'PDF-046', 80],
  ['Laptop Matches', 'Special Effects', 'PDF-047', 190],
  ['7 Up Shot', 'Aerial', 'PDF-048', 110],
  ['Chotta Fancy Single', 'Fancy Crackers', 'PDF-049', 60],
  ['4 inch Single', 'Aerial', 'PDF-050', 380],
  ['6 inch Boom Series 2pcs', 'Sound Crackers', 'PDF-051', 1500],
  ['Double Ball', 'Aerial', 'PDF-052', 590],
  ['Start King', 'Aerial', 'PDF-053', 860],
  ['240 Shot Multicolor with Crackling', 'Aerial', 'PDF-054', 3450],
  ['Snake Tablet Big', 'Ground Crackers', 'PDF-055', 45],
  ['12cm Electric Sparklers', 'Sparklers', 'PDF-056', 29],
  ['50cm Colour Sparklers', 'Sparklers', 'PDF-057', 195],
  ['10x10 Celebration Moments Multicolor', 'Aerial', 'PDF-058', 3700]
];
const additionalPdfProducts = [
  ['2 3/4 inch Kuruvi', 'Single Boys Crackers', 'PDF-059', 9],
  ['3 1/2 inch Lakshmi Crackers', 'Single Boys Crackers', 'PDF-060', 15],
  ['4 inch Lakshmi Crackers', 'Single Boys Crackers', 'PDF-061', 25],
  ['5 inch Jallikattu', 'Single Boys Crackers', 'PDF-062', 65],
  ['6 inch Avengers', 'Single Boys Crackers', 'PDF-063', 70],
  ['Flower Pot Ashoka', 'Ground Spinners', 'PDF-064', 145],
  ['Flower Pot Colour Koti', 'Ground Spinners', 'PDF-065', 240],
  ['Hydro Boom', 'Sound Crackers', 'PDF-066', 85],
  ['Classic Bomb', 'Sound Crackers', 'PDF-067', 130],
  ['Agni Bomb', 'Sound Crackers', 'PDF-068', 140],
  ['Digital Bomb', 'Sound Crackers', 'PDF-069', 280],
  ['1KG Paper Bomb', 'Sound Crackers', 'PDF-070', 190],
  ['Bada Peacock', 'Aerial', 'PDF-071', 460],
  ['Moon Drop', 'Aerial', 'PDF-072', 110],
  ['Red Sun', 'Aerial', 'PDF-073', 210],
  ['Blue Eyes', 'Aerial', 'PDF-074', 210],
  ['Power Pot', 'Fountains', 'PDF-075', 225],
  ['Angry Bird', 'Kids Diwali', 'PDF-076', 105],
  ['Jolly Range', 'Kids Diwali', 'PDF-077', 38],
  ['Lion King', 'Mega Fountain', 'PDF-078', 200],
  ['Soda Fountain', 'Mega Fountain', 'PDF-079', 420],
  ['Helicopter', 'Kids Diwali', 'PDF-080', 120],
  ['Bambaram', 'Kids Diwali', 'PDF-081', 125],
  ['Drone', 'Kids Diwali', 'PDF-082', 180],
  ['Selfie Stick', 'Kids Diwali', 'PDF-083', 140],
  ['PUBG Gun', 'Exclusive Collection', 'PDF-084', 185],
  ['Moye Moye', 'Exclusive Collection', 'PDF-085', 220],
  ['Sky Dive 3pcs', 'Exclusive Collection', 'PDF-086', 210],
  ['Lollipop', 'Exclusive Collection', 'PDF-087', 170],
  ['12 Shot Rider', 'Sky Shots', 'PDF-088', 170],
  ['2 inch Single', 'Fancy Crackers', 'PDF-089', 120],
  ['2 1/2 inch 3pcs', 'Fancy Crackers', 'PDF-090', 320],
  ['3 1/2 inch Single', 'Fancy Crackers', 'PDF-091', 330],
  ['3 1/2 inch 2pcs', 'Fancy Crackers', 'PDF-092', 620],
  ['5 inch HD Series 2pcs', 'Mega Display', 'PDF-093', 1000],
  ['6 inch Train Series 2pcs', 'Mega Display', 'PDF-094', 1200],
  ['Nayagara Falls', 'Sky Collections', 'PDF-096', 420],
  ['30 Shot Multicolor', 'Repeating Shots', 'PDF-097', 410],
  ['30 Shot Multicolor with Crackling', 'Repeating Shots', 'PDF-098', 450],
  ['60 Shot Multicolor with Crackling', 'Repeating Shots', 'PDF-099', 860],
  ['120 Shot Multicolor with Crackling', 'Repeating Shots', 'PDF-100', 1700],
  ['Electric Stone', 'Old Is Gold', 'PDF-101', 20],
  ['Ring Gun Sony', 'Old Is Gold', 'PDF-102', 120],
  ['Ring Cap 9pcs', 'Old Is Gold', 'PDF-103', 30],
  ['Kitkat', 'Old Is Gold', 'PDF-104', 35],
  ['Carton', 'Old Is Gold', 'PDF-105', 20],
  ['12cm Colour Sparklers', 'Sparklers', 'PDF-106', 32],
  ['12cm Green Sparklers', 'Sparklers', 'PDF-107', 35],
  ['12cm Red Sparklers', 'Sparklers', 'PDF-108', 38],
  ['15cm Electric Sparklers', 'Sparklers', 'PDF-109', 40],
  ['15cm Colour Sparklers', 'Sparklers', 'PDF-110', 42],
  ['15cm Green Sparklers', 'Sparklers', 'PDF-111', 45],
  ['15cm Red Sparklers', 'Sparklers', 'PDF-112', 49],
  ['30cm Electric Sparklers', 'Sparklers', 'PDF-113', 40],
  ['30cm Colour Sparklers', 'Sparklers', 'PDF-114', 42],
  ['30cm Green Sparklers', 'Sparklers', 'PDF-115', 45],
  ['30cm Red Sparklers', 'Sparklers', 'PDF-116', 49],
  ['50cm Electric Sparklers', 'Sparklers', 'PDF-117', 180],
  ['10x10 Master Piece Crackling', 'Grand Finale Shots', 'PDF-118', 3900],
  ['Cinderella 24 Item', 'Gift Box', 'PDF-119', 380],
  ['Holi 33 Item', 'Gift Box', 'PDF-120', 600],
  ['Festival Feast 42 Item', 'Gift Box', 'PDF-121', 850],
  ['Lord Murugan 51 Item', 'Gift Box', 'PDF-122', 1200],
  ['Kids Combo Pack', 'Combo Pack', 'PDF-123', 3500],
  ['Budget Combo Pack', 'Combo Pack', 'PDF-124', 5000],
  ['Family Combo Pack', 'Combo Pack', 'PDF-125', 7500],
  ['VIP Combo Pack', 'Combo Pack', 'PDF-126', 10000]
];
if (db.prepare('SELECT COUNT(*) AS count FROM products').get().count === 0) {
  const insert = db.prepare('INSERT INTO products (name, category, sku, price, stock, reorder_level) VALUES (?, ?, ?, ?, ?, ?)');
  db.exec('BEGIN');
  try { seedProducts.forEach((product) => insert.run(...product)); db.exec('COMMIT'); } catch (error) { db.exec('ROLLBACK'); throw error; }
}
const importPdfProduct = db.prepare('INSERT OR IGNORE INTO products (name, category, sku, price, stock, reorder_level) VALUES (?, ?, ?, ?, 0, 30)');
pdfProducts.forEach((product) => importPdfProduct.run(...product));
additionalPdfProducts.forEach((product) => importPdfProduct.run(...product));
db.exec('UPDATE products SET reorder_level = 30 WHERE reorder_level < 30');
db.prepare('UPDATE products SET name = ?, category = ?, price = ? WHERE sku = ?').run('Lunik Rocket', 'Rockets', 120, 'PDF-025');
db.prepare('UPDATE products SET name = ?, category = ?, price = ? WHERE sku = ?').run('1/2KG Paper Bomb', 'Rugged Bombs', 120, 'PDF-029');
db.prepare('UPDATE products SET name = ?, category = ?, price = ? WHERE sku = ?').run('12 Step 3D', 'Sky Collections', 450, 'PDF-053');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/price-list', (req, res) => res.sendFile(path.join(__dirname, 'price-list.pdf')));
const productSelect = 'SELECT id, name, category, sku, price, stock, reorder_level AS reorderLevel, updated_at AS updatedAt FROM products';

app.get('/api/dashboard', (req, res) => {
  const totals = db.prepare(`SELECT
    (SELECT COUNT(*) FROM products) AS productCount,
    (SELECT COALESCE(SUM(stock), 0) FROM products) AS stockUnits,
    (SELECT COUNT(*) FROM products WHERE stock <= reorder_level) AS lowStockCount,
    (SELECT COALESCE(SUM(total), 0) FROM bills WHERE date(created_at) = date('now', 'localtime')) AS todaySales,
    (SELECT COUNT(*) FROM bills WHERE date(created_at) = date('now', 'localtime')) AS todayBills`).get();
  const recentBills = db.prepare('SELECT id, bill_number AS billNumber, customer_name AS customerName, total, created_at AS createdAt FROM bills ORDER BY id DESC LIMIT 6').all();
  res.json({ ...totals, recentBills });
});

app.get('/api/products', (req, res) => {
  const search = String(req.query.search || '').trim();
  const products = search
    ? db.prepare(`${productSelect} WHERE name LIKE ? OR sku LIKE ? OR category LIKE ? ORDER BY name`).all(`%${search}%`, `%${search}%`, `%${search}%`)
    : db.prepare(`${productSelect} ORDER BY name`).all();
  res.json(products);
});

app.post('/api/products', (req, res) => {
  const { name, category, sku, price, stock, reorderLevel } = req.body;
  if (!name || !sku || !Number.isFinite(Number(price)) || !Number.isInteger(Number(stock))) return res.status(400).json({ error: 'Name, SKU, price, and stock are required.' });
  try {
    const result = db.prepare('INSERT INTO products (name, category, sku, price, stock, reorder_level, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)').run(String(name).trim(), String(category || 'Crackers').trim(), String(sku).trim().toUpperCase(), Number(price), Number(stock), Math.max(30, Number(reorderLevel) || 30));
    res.status(201).json(db.prepare(`${productSelect} WHERE id = ?`).get(result.lastInsertRowid));
  } catch (error) { res.status(400).json({ error: error.code === 'SQLITE_CONSTRAINT_UNIQUE' ? 'That SKU already exists.' : 'Could not save the product.' }); }
});

app.put('/api/products/:id', (req, res) => {
  const { name, category, sku, price, stock, reorderLevel } = req.body;
  if (!name || !sku || !Number.isFinite(Number(price)) || !Number.isInteger(Number(stock))) return res.status(400).json({ error: 'Name, SKU, price, and stock are required.' });
  try {
    const result = db.prepare('UPDATE products SET name = ?, category = ?, sku = ?, price = ?, stock = ?, reorder_level = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(String(name).trim(), String(category || 'Crackers').trim(), String(sku).trim().toUpperCase(), Number(price), Number(stock), Math.max(30, Number(reorderLevel) || 30), Number(req.params.id));
    if (!result.changes) return res.status(404).json({ error: 'Product not found.' });
    res.json(db.prepare(`${productSelect} WHERE id = ?`).get(req.params.id));
  } catch (error) { res.status(400).json({ error: error.code === 'SQLITE_CONSTRAINT_UNIQUE' ? 'That SKU already exists.' : 'Could not update the product.' }); }
});

app.delete('/api/products/:id', (req, res) => {
  const used = db.prepare('SELECT COUNT(*) AS count FROM bill_items WHERE product_id = ?').get(req.params.id).count;
  if (used) return res.status(400).json({ error: 'This product is part of a saved bill and cannot be deleted.' });
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Product not found.' });
  res.status(204).end();
});

app.get('/api/bills', (req, res) => {
  const search = String(req.query.search || '').trim();
  const sql = 'SELECT id, bill_number AS billNumber, customer_name AS customerName, customer_phone AS customerPhone, total, created_at AS createdAt FROM bills';
  const bills = search ? db.prepare(`${sql} WHERE bill_number LIKE ? OR customer_name LIKE ? ORDER BY id DESC`).all(`%${search}%`, `%${search}%`) : db.prepare(`${sql} ORDER BY id DESC`).all();
  res.json(bills);
});

app.get('/api/bills/:id', (req, res) => {
  const bill = db.prepare('SELECT id, bill_number AS billNumber, customer_name AS customerName, customer_phone AS customerPhone, subtotal, discount, tax, total, created_at AS createdAt FROM bills WHERE id = ? OR bill_number = ?').get(req.params.id, req.params.id);
  if (!bill) return res.status(404).json({ error: 'Bill not found.' });
  bill.items = db.prepare('SELECT product_id AS productId, product_name AS productName, quantity, price, line_total AS lineTotal FROM bill_items WHERE bill_id = ?').all(bill.id);
  res.json(bill);
});

app.put('/api/bills/:id/customer', (req, res) => {
  const customerName = String(req.body.customerName || '').trim();
  const customerPhone = String(req.body.customerPhone || '').trim();
  if (!customerName) return res.status(400).json({ error: 'Customer name is required.' });
  const result = db.prepare('UPDATE bills SET customer_name = ?, customer_phone = ? WHERE id = ?').run(customerName, customerPhone, Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: 'Bill not found.' });
  res.json({ id: Number(req.params.id), customerName, customerPhone });
});

app.post('/api/bills', (req, res) => {
  const { customerName, customerPhone, discount = 0, tax = 0, items } = req.body;
  if (!customerName || !Array.isArray(items) || !items.length) return res.status(400).json({ error: 'Customer name and at least one item are required.' });
  try {
    const createBill = () => {
      db.exec('BEGIN');
      try {
      const normalizedItems = items.map((item) => {
        const product = db.prepare('SELECT id, name, price, stock FROM products WHERE id = ?').get(Number(item.productId));
        const quantity = Number(item.quantity);
        if (!product) throw new Error('One selected product no longer exists.');
        if (!Number.isInteger(quantity) || quantity < 1) throw new Error(`Invalid quantity for ${product.name}.`);
        if (product.stock < quantity) throw new Error(`Not enough stock for ${product.name}. Only ${product.stock} left.`);
        return { product, quantity, lineTotal: product.price * quantity };
      });
      const subtotal = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);
      const safeDiscount = Math.max(0, Number(discount) || 0);
      const safeTax = Math.max(0, Number(tax) || 0);
      const total = Math.max(0, subtotal - safeDiscount + safeTax);
      const billNumber = `AK-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${String(Date.now()).slice(-5)}`;
      const result = db.prepare('INSERT INTO bills (bill_number, customer_name, customer_phone, subtotal, discount, tax, total) VALUES (?, ?, ?, ?, ?, ?, ?)').run(billNumber, String(customerName).trim(), String(customerPhone || '').trim(), subtotal, safeDiscount, safeTax, total);
      const insertItem = db.prepare('INSERT INTO bill_items (bill_id, product_id, product_name, quantity, price, line_total) VALUES (?, ?, ?, ?, ?, ?)');
      const reduceStock = db.prepare('UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      normalizedItems.forEach(({ product, quantity, lineTotal }) => { insertItem.run(result.lastInsertRowid, product.id, product.name, quantity, product.price, lineTotal); reduceStock.run(quantity, product.id); });
        db.exec('COMMIT');
        return result.lastInsertRowid;
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    };
    const billId = createBill();
    res.status(201).json(db.prepare('SELECT id, bill_number AS billNumber FROM bills WHERE id = ?').get(billId));
  } catch (error) { res.status(400).json({ error: error.message || 'Could not create bill.' }); }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log(`AK Crackers Billing running on port ${PORT}`));