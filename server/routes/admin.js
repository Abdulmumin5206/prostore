import express from 'express';
import multer from 'multer';
import crypto from 'node:crypto';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { supabaseAdmin } from '../utils/supabase.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function tableFor(type) {
  return type === 'new' ? 'new_products' : type === 'secondhand' ? 'secondhand_products' : null;
}

router.get('/', authenticate, requireAdmin, (_req, res) => {
  res.json({ ok: true });
});

// Upload image to Storage via service role
router.post('/upload', authenticate, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const folder = req.body.folder;
    if (!file) return res.status(400).json({ message: 'file is required' });
    if (!folder || !['new', 'secondhand'].includes(folder)) {
      return res.status(400).json({ message: 'folder must be "new" or "secondhand"' });
    }

    const path = `${folder}/${crypto.randomUUID()}-${file.originalname}`;
    const { error: uploadError } = await supabaseAdmin
      .storage
      .from('products')
      .upload(path, file.buffer, { contentType: file.mimetype, upsert: true });
    if (uploadError) throw uploadError;

    const { data: urlData } = await supabaseAdmin.storage.from('products').getPublicUrl(path);
    return res.json({ url: urlData.publicUrl, path });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Upload failed' });
  }
});

// Create product
router.post('/products/:type', authenticate, requireAdmin, async (req, res) => {
  try {
    const type = req.params.type;
    const table = tableFor(type);
    if (!table) return res.status(400).json({ message: 'invalid type' });

    const payload = req.body || {};
    const { error } = await supabaseAdmin.from(table).insert(payload);
    if (error) throw error;
    return res.status(201).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Create failed' });
  }
});

// Update product
router.put('/products/:type/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const type = req.params.type;
    const id = req.params.id;
    const table = tableFor(type);
    if (!table) return res.status(400).json({ message: 'invalid type' });

    const payload = req.body || {};
    const { error } = await supabaseAdmin.from(table).update(payload).eq('id', id);
    if (error) throw error;
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Update failed' });
  }
});

// Delete product
router.delete('/products/:type/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const type = req.params.type;
    const id = req.params.id;
    const table = tableFor(type);
    if (!table) return res.status(400).json({ message: 'invalid type' });

    const { error } = await supabaseAdmin.from(table).delete().eq('id', id);
    if (error) throw error;
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Delete failed' });
  }
});

// Add category
router.post('/categories', authenticate, requireAdmin, async (req, res) => {
  try {
    const name = (req.body?.name || '').toString().trim();
    if (!name) return res.status(400).json({ message: 'name is required' });
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({ name })
      .select('*')
      .single();
    if (error) throw error;
    return res.status(201).json({ category: data });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Add category failed' });
  }
});

export default router; 