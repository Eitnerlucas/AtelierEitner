// Admin Panel Logic for Atelier Eitner
document.addEventListener('DOMContentLoaded', () => {
  const PIN_KEY = 'atelier_admin_pin';
  const DEFAULT_PIN = '7419';
  const STORAGE_KEY = 'atelier_custom_products';

  const DEFAULT_SUPABASE_URL = 'https://wqueudoaryvtuynfzdbv.supabase.co';
  const DEFAULT_SUPABASE_KEY = 'sb_publishable_jKM-u8kRlhX8GqomSwZscw_ImsSpKb0';

  function getSupabaseConfig() {
    let rawUrl = DEFAULT_SUPABASE_URL.trim();
    let key = DEFAULT_SUPABASE_KEY.trim();

    rawUrl = rawUrl.replace(/\/+$/, '');
    rawUrl = rawUrl.replace(/\/rest\/v1$/i, '');

    return {
      baseUrl: rawUrl,
      endpoint: `${rawUrl}/rest/v1/productos`,
      key: key
    };
  }

  const lockScreen = document.getElementById('lockScreen');
  const adminContent = document.getElementById('adminContent');
  const loginForm = document.getElementById('loginForm');
  const adminPinInput = document.getElementById('adminPin');
  const lockError = document.getElementById('lockError');

  const addProductForm = document.getElementById('addProductForm');
  const itemImageInput = document.getElementById('itemImage');
  const imagePreview = document.getElementById('imagePreview');
  const uploadPlaceholder = document.getElementById('uploadPlaceholder');
  const itemTitleInput = document.getElementById('itemTitle');
  const itemCategorySelect = document.getElementById('itemCategory');
  const itemDescInput = document.getElementById('itemDesc');
  const saveBtn = document.getElementById('saveBtn');

  const addSuccess = document.getElementById('addSuccess');
  const addError = document.getElementById('addError');
  const adminProductList = document.getElementById('adminProductList');
  const adminCount = document.getElementById('adminCount');

  let currentBase64Image = '';

  // Check login state
  if (sessionStorage.getItem('atelier_admin_logged') === 'true') {
    unlockPanel();
  }

  // Handle Login
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const enteredPin = adminPinInput.value.trim();
    const validPin = localStorage.getItem(PIN_KEY) || DEFAULT_PIN;

    if (enteredPin === validPin) {
      sessionStorage.setItem('atelier_admin_logged', 'true');
      unlockPanel();
    } else {
      lockError.style.display = 'block';
    }
  });

  function unlockPanel() {
    lockScreen.style.display = 'none';
    adminContent.style.display = 'block';
    renderAdminProducts();
  }

  // Handle Image Upload & Compression (with HEIC / HEIF support)
  itemImageInput.addEventListener('change', async (e) => {
    let file = e.target.files[0];
    if (!file) return;

    // Detect HEIC / HEIF format from iPhone
    const isHeic = file.name.toLowerCase().endsWith('.heic') || 
                   file.name.toLowerCase().endsWith('.heif') || 
                   file.type === 'image/heic' || 
                   file.type === 'image/heif';

    if (isHeic && typeof heic2any !== 'undefined') {
      try {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Procesando imagen HEIC...';
        uploadPlaceholder.innerHTML = '<span style="font-size: 1.5rem;">⏳</span><p style="margin:6px 0 0 0;font-weight:600;">Convertiendo foto de iPhone...</p>';

        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.85
        });

        file = new File([Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' });
        saveBtn.disabled = false;
        saveBtn.textContent = '✨ Publicar en el Catálogo';
      } catch (err) {
        console.warn('Error al convertir imagen HEIC:', err);
        saveBtn.disabled = false;
        saveBtn.textContent = '✨ Publicar en el Catálogo';
      }
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        currentBase64Image = canvas.toDataURL('image/jpeg', 0.82);
        imagePreview.src = currentBase64Image;
        imagePreview.style.display = 'inline-block';
        uploadPlaceholder.style.display = 'none';
      };
    };
    reader.readAsDataURL(file);
  });

  function getCustomProducts() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch(e) {
      return [];
    }
  }

  function saveCustomProducts(products) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      window.dispatchEvent(new Event('storage'));
    } catch(e) {}
  }

  // Render Admin Product List from Supabase
  async function renderAdminProducts() {
    if (adminProductList) {
      adminProductList.innerHTML = '<p style="color: rgba(58,50,38,0.6); padding: 12px 0;">🔄 Cargando catálogo desde la base de datos...</p>';
    }

    let customItems = getCustomProducts();
    const config = getSupabaseConfig();

    if (config) {
      try {
        const response = await fetch(`${config.endpoint}?select=*&order=id.desc`, {
          headers: {
            'apikey': config.key,
            'Authorization': `Bearer ${config.key}`
          }
        });
        if (response.ok) {
          const remoteData = await response.json();
          if (Array.isArray(remoteData)) {
            customItems = remoteData;
            saveCustomProducts(customItems);
          }
        }
      } catch (err) {
        console.warn('Usando respaldo local:', err);
      }
    }

    if (adminCount) adminCount.textContent = customItems.length;

    if (customItems.length === 0) {
      adminProductList.innerHTML = '<p style="color: rgba(58,50,38,0.6); padding: 12px 0;">Aún no tenés productos cargados en la base de datos.</p>';
      return;
    }

    adminProductList.innerHTML = customItems.map(item => `
      <div class="product-item-row" data-id="${item.id}">
        <img src="${item.src}" alt="${item.title}">
        <div class="product-item-info">
          <h4>${item.title}</h4>
          <p><strong>Categoría:</strong> ${getCategoryLabel(item.category)} | ${item.desc || 'Sin descripción'}</p>
        </div>
        <button class="btn-delete" onclick="deleteProduct(${item.id})">🗑️ Eliminar</button>
      </div>
    `).join('');
  }

  function getCategoryLabel(cat) {
    const map = {
      'mesas-candybar': 'Mesas y muebles',
      'estanterias-exhibidores': 'Estanterías y Exhibidores',
      'fondos-paneles': 'Fondos y Paneles',
      'letras-luminosas': 'Letras y Deco Luminosa'
    };
    return map[cat] || cat;
  }

  // Save New Product
  addProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentBase64Image) {
      alert('Por favor seleccioná una foto.');
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = 'Guardando en la base de datos...';

    const newItem = {
      id: Date.now(),
      src: currentBase64Image,
      category: itemCategorySelect.value,
      title: itemTitleInput.value.trim(),
      desc: itemDescInput.value.trim(),
      created_at: new Date().toISOString()
    };

    const config = getSupabaseConfig();

    if (config) {
      try {
        await fetch(config.endpoint, {
          method: 'POST',
          headers: {
            'apikey': config.key,
            'Authorization': `Bearer ${config.key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(newItem)
        });
      } catch (err) {
        console.error('Error al guardar en Supabase:', err);
      }
    }

    // Reset Form
    addProductForm.reset();
    currentBase64Image = '';
    imagePreview.style.display = 'none';
    uploadPlaceholder.style.display = 'block';

    saveBtn.disabled = false;
    saveBtn.textContent = '✨ Publicar en el Catálogo';

    addSuccess.style.display = 'block';
    setTimeout(() => { addSuccess.style.display = 'none'; }, 4000);

    await renderAdminProducts();
  });

  // Global delete handler
  window.deleteProduct = async function(id) {
    if (!confirm('¿Estás seguro de que querés eliminar este producto de la base de datos?')) return;

    const config = getSupabaseConfig();
    if (config) {
      try {
        await fetch(`${config.endpoint}?id=eq.${id}`, {
          method: 'DELETE',
          headers: {
            'apikey': config.key,
            'Authorization': `Bearer ${config.key}`
          }
        });
      } catch (err) {
        console.error('Error al eliminar en Supabase:', err);
      }
    }

    await renderAdminProducts();
  };
});
