# AK Crackers Billing

Billing and inventory dashboard for a crackers shop.

The official 2026 price-list PDF is available inside the app from the New bill screen at `/price-list`. The readable product rows from that PDF are imported into SQLite with `PDF-###` SKUs. Product prices used during billing are stored in SQLite so the cashier can search and add products without leaving the bill. Imported catalog products start with zero stock and can be stocked from Inventory before billing.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000`. SQLite data is stored in `data/billing.sqlite` locally. On Render, the included `render.yaml` mounts a persistent disk at `/var/data`.

## Deploy on Render

Push this folder to a GitHub repository, create a new **Blueprint** in Render, and select the repository. Render will read `render.yaml`, install dependencies on Node 24, start the web service, and keep the SQLite database on its persistent disk. Use the generated `onrender.com` URL on other devices.