const express = require('express');
const router = express.Router();
const ProductDB = require('../models/ProductModel');

router.get('/sitemap.xml', async (req, res) => {
  try {
    const products = await ProductDB.find({}, '_id updatedAt');
    
    // Production domain configuration fallback
    const baseUrl = process.env.FRONTEND_URL;

    const staticRoutes = [
      { url: '', changefreq: 'daily', priority: '1.0' },
      { url: '/shop', changefreq: 'daily', priority: '0.8' },
      { url: '/about', changefreq: 'monthly', priority: '0.5' },
      { url: '/contact', changefreq: 'monthly', priority: '0.5' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Add Static Routes
    staticRoutes.forEach(route => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${route.url}</loc>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Add Dynamic Product Routes
    products.forEach(product => {
      const lastModDate = product.updatedAt 
        ? new Date(product.updatedAt).toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0];

      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/product/${product._id}</loc>\n`;
      xml += `    <lastmod>${lastModDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (err) {
    console.error('Error generating sitemap:', err);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
