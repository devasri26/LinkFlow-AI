const useragent = require('useragent');
const Url = require('../models/Url');
const Visit = require('../models/Visit');

const handleRedirect = async (req, res) => {
  const { code } = req.params;

  try {
    // Search for code or custom alias
    const url = await Url.findOne({ shortCode: code });
    
    if (!url) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Link Not Found | LinkFlow AI</title>
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap" rel="stylesheet">
          <style>
            body {
              background: radial-gradient(circle at center, #0f172a, #020617);
              color: #f8fafc;
              font-family: 'Outfit', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              text-align: center;
            }
            .container {
              border: 1px solid rgba(99, 102, 241, 0.2);
              background: rgba(15, 23, 42, 0.6);
              backdrop-filter: blur(12px);
              border-radius: 16px;
              padding: 40px;
              max-width: 450px;
              box-shadow: 0 0 40px rgba(99, 102, 241, 0.1);
            }
            h1 {
              font-size: 2.5rem;
              margin-bottom: 10px;
              background: linear-gradient(135deg, #a5b4fc, #6366f1);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            p {
              color: #94a3b8;
              font-size: 1.1rem;
              margin-bottom: 30px;
            }
            .btn {
              background: linear-gradient(135deg, #6366f1, #4f46e5);
              color: #ffffff;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              transition: all 0.2s;
              box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
            }
            .btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>404 Code Invalid</h1>
            <p>The LinkFlow URL you requested does not exist or has been removed from our server.</p>
            <a href="/" class="btn">Return to Control Center</a>
          </div>
        </body>
        </html>
      `);
    }

    if (!url.isActive) {
      return res.status(403).send('This URL is currently disabled.');
    }

    // Check expiration
    if (url.expiryDate) {
      const isExpired = new Date() > new Date(url.expiryDate);
      if (isExpired) {
        return res.status(410).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Link Expired | LinkFlow AI</title>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap" rel="stylesheet">
            <style>
              body {
                background: radial-gradient(circle at center, #0f172a, #020617);
                color: #f8fafc;
                font-family: 'Outfit', sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                text-align: center;
              }
              .container {
                border: 1px solid rgba(239, 68, 68, 0.2);
                background: rgba(15, 23, 42, 0.6);
                backdrop-filter: blur(12px);
                border-radius: 16px;
                padding: 40px;
                max-width: 450px;
                box-shadow: 0 0 40px rgba(239, 68, 68, 0.1);
              }
              h1 {
                font-size: 2.5rem;
                margin-bottom: 10px;
                background: linear-gradient(135deg, #fca5a5, #ef4444);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
              }
              p {
                color: #94a3b8;
                font-size: 1.1rem;
                margin-bottom: 30px;
              }
              .btn {
                background: linear-gradient(135deg, #ef4444, #dc2626);
                color: #ffffff;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                transition: all 0.2s;
                box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
              }
              .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5);
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Link Expired</h1>
              <p>The LinkFlow URL you requested has expired on ${new Date(url.expiryDate).toLocaleString()}</p>
              <a href="/" class="btn">Return to Control Center</a>
            </div>
          </body>
          </html>
        `);
      }
    }

    // Parse user agent
    const rawUa = req.headers['user-agent'] || '';
    const agent = useragent.parse(rawUa);
    const os = agent.os.toString();
    const browser = agent.toAgent();

    // Map OS to chart groups
    let osName = 'Other';
    if (/windows/i.test(os)) osName = 'Windows';
    else if (/mac os/i.test(os) || /macintosh/i.test(os)) osName = 'macOS';
    else if (/android/i.test(os)) osName = 'Android';
    else if (/iphone|ipad|ipod/i.test(os) || /ios/i.test(os)) osName = 'iOS';
    else if (/linux/i.test(os)) osName = 'Linux';

    // Map Browser to chart groups
    let browserName = 'Other';
    if (/chrome/i.test(browser)) browserName = 'Chrome';
    else if (/firefox/i.test(browser)) browserName = 'Firefox';
    else if (/safari/i.test(browser)) browserName = 'Safari';
    else if (/edge/i.test(browser)) browserName = 'Edge';
    else if (/opera/i.test(browser)) browserName = 'Opera';

    // Map Device category
    let deviceCategory = 'Desktop';
    if (/tablet|ipad|playbook|silk/i.test(rawUa)) {
      deviceCategory = 'Tablet';
    } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(rawUa)) {
      deviceCategory = 'Mobile';
    }

    // Record visit details with explicit timestamp
    const visitTimestamp = new Date();
    const visit = await Visit.create({
      urlId: url._id,
      timestamp: visitTimestamp,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      device: deviceCategory,
      browser: browserName,
      os: osName,
      country: 'Local' // Fallback country
    });

    // Update clicks
    url.clicks = (url.clicks || 0) + 1;
    await url.save();

    // Add logging to verify click tracking and analytics save
    console.log(`[REDIRECT] Short code visited: ${code}`);
    console.log(`[REDIRECT] Click count incremented. New count: ${url.clicks}`);
    console.log(`[REDIRECT] Visit timestamp saved: ${visitTimestamp.toISOString()}`);

    // Redirect
    return res.redirect(url.originalUrl);
  } catch (error) {
    console.error('Redirect handler error:', error);
    return res.status(500).send('Server error redirecting link');
  }
};

module.exports = {
  handleRedirect
};
