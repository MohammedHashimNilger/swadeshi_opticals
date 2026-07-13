import Settings from "../models/Settings.js";

// GET /api/settings — public (frontend needs delivery charge, store address, etc.)
export async function getSettings(req, res, next) {
  try {
    const settings = await Settings.getSingleton();
    res.json(settings);
  } catch (err) {
    console.error("Settings fetch error:", err);
    // Return default settings instead of 500 to allow site to function
    res.json({
      storeName: "Swadeshi Opticals",
      storePhone: "+91 94134 60346",
      storeWhatsapp: "919413460346",
      storeEmail: "id.swadeshi.opticals051@gmail.com",
      deliveryCharge: 0,
    });
  }
}

// PUT /api/admin/settings — admin only
export async function updateSettings(req, res, next) {
  try {
    const settings = await Settings.getSingleton();
    Object.assign(settings, req.body);
    await settings.save();
    res.json(settings);
  } catch (err) {
    next(err);
  }
}
