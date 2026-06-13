const crypto = require('crypto');
const stream = require('stream');
const csv = require('csv-parser');
const Url = require('../models/Url');
const Visit = require('../models/Visit');

// Helper to validate url
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Helper to generate unique short code
const generateShortCode = () => {
  return crypto.randomBytes(4).toString('hex').substring(0, 7);
};

// Formats URL document to inject dynamic shortUrl based on process.env.BASE_URL
const formatUrlDoc = (urlDoc) => {
  if (!urlDoc) return null;
  const doc = urlDoc.toJSON ? urlDoc.toJSON() : { ...urlDoc };
  const base = process.env.BASE_URL || 'http://localhost:5000';
  const cleanBase = base.replace(/\/$/, '');
  doc.shortUrl = `${cleanBase}/${doc.shortCode}`;
  doc.id = doc._id;
  return doc;
};


// Create a short URL
const createUrl = async (req, res) => {
  const { originalUrl, customAlias, expiryDate, title } = req.body;
  const userId = req.user ? req.user.id : null;

  try {
    if (!originalUrl) {
      return res.status(400).json({ message: 'Original URL is required' });
    }

    // Format URL (prepend protocol if missing)
    let formattedUrl = originalUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    if (!isValidUrl(formattedUrl)) {
      return res.status(400).json({ message: 'Invalid URL format' });
    }

    let shortCode = '';
    
    if (customAlias && customAlias.trim() !== '') {
      const sanitizedAlias = customAlias.trim().replace(/[^a-zA-Z0-9-_]/g, '');
      if (sanitizedAlias.length < 3) {
        return res.status(400).json({ message: 'Custom alias must be at least 3 alphanumeric characters' });
      }

      // Check if custom alias is already taken
      const aliasExists = await Url.findOne({
        $or: [{ shortCode: sanitizedAlias }, { customAlias: sanitizedAlias }]
      });
      if (aliasExists) {
        return res.status(400).json({ message: 'Custom alias or code is already in use' });
      }
      shortCode = sanitizedAlias;
    } else {
      // Generate unique short code
      let unique = false;
      while (!unique) {
        shortCode = generateShortCode();
        const codeExists = await Url.findOne({ shortCode });
        if (!codeExists) {
          unique = true;
        }
      }
    }

    const newUrl = await Url.create({
      originalUrl: formattedUrl,
      shortCode,
      customAlias: customAlias ? customAlias.trim() : null,
      title: title ? title.trim() : 'LinkFlow URL',
      userId,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      clicks: 0,
      isActive: true
    });

    return res.status(201).json(formatUrlDoc(newUrl));
  } catch (error) {
    console.error('Create URL error:', error);
    return res.status(500).json({ message: 'Server error creating shortened link' });
  }
};

// Retrieve User URLs (supports search and pagination)
const getUserUrls = async (req, res) => {
  const userId = req.user.id;
  const { search } = req.query;

  try {
    const query = { userId };
    
    const urls = await Url.find(query);
    
    // Sort locally by createdAt desc
    let results = urls.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Handle search query locally
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase();
      results = results.filter(
        url => 
          (url.title && url.title.toLowerCase().includes(searchLower)) ||
          (url.originalUrl && url.originalUrl.toLowerCase().includes(searchLower)) ||
          (url.shortCode && url.shortCode.toLowerCase().includes(searchLower))
      );
    }

    return res.status(200).json(results.map(formatUrlDoc));
  } catch (error) {
    console.error('Get User URLs error:', error);
    return res.status(500).json({ message: 'Server error retrieving links' });
  }
};

// Delete a short URL
const deleteUrl = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const url = await Url.findById(id);
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Secure owner checks
    if (url.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this URL' });
    }

    await Url.findByIdAndDelete(id);
    return res.status(200).json({ message: 'URL and data deleted successfully', id });
  } catch (error) {
    console.error('Delete URL error:', error);
    return res.status(500).json({ message: 'Server error deleting URL' });
  }
};

// Helper function to parse CSV buffers
const parseCsvBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    bufferStream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

// Bulk upload URLs via CSV
const bulkUploadUrls = async (req, res) => {
  const userId = req.user.id;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a CSV file' });
    }

    const csvRows = await parseCsvBuffer(req.file.buffer);
    const createdUrls = [];
    const errors = [];

    for (let index = 0; index < csvRows.length; index++) {
      const row = csvRows[index];
      let { originalUrl, title, customAlias, expiryDate } = row;

      if (!originalUrl) {
        errors.push(`Row ${index + 1}: Missing originalUrl`);
        continue;
      }

      let formattedUrl = originalUrl.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
      }

      if (!isValidUrl(formattedUrl)) {
        errors.push(`Row ${index + 1}: Invalid URL (${originalUrl})`);
        continue;
      }

      let shortCode = '';
      if (customAlias && customAlias.trim() !== '') {
        const sanitizedAlias = customAlias.trim().replace(/[^a-zA-Z0-9-_]/g, '');
        const aliasExists = await Url.findOne({
          $or: [{ shortCode: sanitizedAlias }, { customAlias: sanitizedAlias }]
        });
        if (aliasExists) {
          errors.push(`Row ${index + 1}: Alias '${sanitizedAlias}' already in use`);
          continue;
        }
        shortCode = sanitizedAlias;
      } else {
        let unique = false;
        while (!unique) {
          shortCode = generateShortCode();
          const codeExists = await Url.findOne({ shortCode });
          if (!codeExists) {
            unique = true;
          }
        }
      }

      try {
        const newUrl = await Url.create({
          originalUrl: formattedUrl,
          shortCode,
          customAlias: customAlias ? customAlias.trim() : null,
          title: title ? title.trim() : `Bulk Link ${index + 1}`,
          userId,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          clicks: 0,
          isActive: true
        });
        createdUrls.push(newUrl);
      } catch (err) {
        errors.push(`Row ${index + 1}: Server creation failure`);
      }
    }

    return res.status(200).json({
      message: `Successfully processed CSV. Created ${createdUrls.length} links.`,
      createdCount: createdUrls.length,
      urls: createdUrls.map(formatUrlDoc),
      errors
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    return res.status(500).json({ message: 'Server error processing CSV file' });
  }
};

// Get Stats for a URL
const getUrlStats = async (req, res) => {
  const { code } = req.params;
  const userId = req.user ? req.user.id : null;

  try {
    const url = await Url.findOne({ shortCode: code });
    if (!url) {
      return res.status(404).json({ message: 'Shortened URL not found' });
    }

    // If it's a private URL (has userId), check permission
    // But we also want a public stats option. Let's allow public stats page retrieval
    // of clicks and charts but require validation if the front-end requests owner-exclusive edit fields.
    // In this case, we can provide stats to any request (since it's a bonus feature "public stats page")
    // but check if they are the owner for editing rights.
    const isOwner = userId && url.userId === userId;

    const visits = await Visit.find({ urlId: url._id });

    // Local JS analytics processing
    const lastVisitObj = visits.length > 0 ? visits[visits.length - 1] : null;
    const lastVisitedTime = lastVisitObj ? (lastVisitObj.timestamp || lastVisitObj.createdAt || null) : null;
    
    const stats = {
      totalClicks: url.clicks || visits.length,
      lastVisited: lastVisitedTime,
      timeline: {},
      devices: { Desktop: 0, Mobile: 0, Tablet: 0 },
      browsers: {},
      os: {}
    };

    visits.forEach(visit => {
      // Timeline (fallback to createdAt or current date if timestamp is missing/invalid)
      const visitTime = visit.timestamp || visit.createdAt || new Date();
      let dateStr;
      try {
        dateStr = new Date(visitTime).toISOString().split('T')[0];
      } catch (err) {
        dateStr = new Date().toISOString().split('T')[0];
      }
      stats.timeline[dateStr] = (stats.timeline[dateStr] || 0) + 1;

      // Devices
      const dev = visit.device || 'Desktop';
      stats.devices[dev] = (stats.devices[dev] || 0) + 1;

      // Browsers
      const brow = visit.browser || 'Unknown';
      stats.browsers[brow] = (stats.browsers[brow] || 0) + 1;

      // OS
      const opsys = visit.os || 'Unknown';
      stats.os[opsys] = (stats.os[opsys] || 0) + 1;
    });

    const timelineData = Object.keys(stats.timeline)
      .sort()
      .map(date => ({ date, clicks: stats.timeline[date] }));

    const browserData = Object.keys(stats.browsers).map(name => ({
      name,
      value: stats.browsers[name]
    }));

    const osData = Object.keys(stats.os).map(name => ({
      name,
      value: stats.os[name]
    }));

    const deviceData = Object.keys(stats.devices).map(name => ({
      name,
      value: stats.devices[name]
    }));

    // Last 10 visits
    const recentVisits = visits.slice(-10).reverse().map(v => ({
      timestamp: v.timestamp,
      browser: v.browser,
      device: v.device,
      os: v.os,
      country: v.country
    }));

    return res.status(200).json({
      url: {
        ...formatUrlDoc(url),
        isOwner
      },
      analytics: {
        totalClicks: stats.totalClicks,
        lastVisited: stats.lastVisited,
        timelineData,
        browserData,
        osData,
        deviceData,
        recentVisits
      }
    });
  } catch (error) {
    console.error('Get URL Stats error:', error);
    return res.status(500).json({ message: 'Server error retrieving analytics' });
  }
};

module.exports = {
  createUrl,
  getUserUrls,
  deleteUrl,
  bulkUploadUrls,
  getUrlStats
};
