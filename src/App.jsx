import React, { useEffect, useMemo, useState } from 'react';
import skincare1 from './assets/images/skin1.jpeg';
import skincare2 from './assets/images/skin2.jpeg';
import skincare3 from './assets/images/skin3.jpeg';

import makeup1 from './assets/images/makeup1.jpeg';
import makeup2 from './assets/images/makeup2.jpeg';
import makeup3 from './assets/images/makeup3.jpeg';

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);
  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return { theme, toggle };
}

const initialProducts = [
  { id: 1, title: "Moisturizer", price: 25, category: "Skin Care", image: skincare1, liked: false },
  { id: 2, title: "Face Wash", price: 15, category: "Skin Care", image: skincare2, liked: false },
  { id: 3, title: "Serum", price: 35, category: "Skin Care", image: skincare3, liked: false },
  { id: 4, title: "Lipstick", price: 20, category: "Makeup", image: makeup1, liked: false },
  { id: 5, title: "Blush", price: 18, category: "Makeup", image: makeup2, liked: false },
  { id: 6, title: "Eyeshadow", price: 22, category: "Makeup", image: makeup3, liked: false },
];

export default function App() {
  const { theme, toggle } = useTheme();
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("wishlist-items");
    return saved ? JSON.parse(saved) : initialProducts;
  });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", price: "", category: "", image: "", file: null });
  const [errors, setErrors] = useState({});
  const [filter, setFilter] = useState("All");

  useEffect(() => localStorage.setItem("wishlist-items", JSON.stringify(items)), [items]);

  const filteredItems = useMemo(() => {
    if (filter === "All") return items;
    return items.filter((it) => it.category === filter);
  }, [items, filter]);

  const total = useMemo(() => filteredItems.reduce((sum, it) => sum + Number(it.price || 0), 0), [filteredItems]);

  function removeItem(id) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  function clearAll() {
    if (confirm("Clear all items?")) setItems([]);
  }

  function openAdd() {
    setIsAddOpen(true);
    setForm({ title: "", price: "", category: "", image: "", file: null });
    setErrors({});
  }

  function closeAdd() {
    setIsAddOpen(false);
  }

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (name === "file" && files && files[0]) {
      setForm((f) => ({ ...f, file: files[0], image: URL.createObjectURL(files[0]) }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    const price = Number(form.price);
    if (Number.isNaN(price) || price <= 0) errs.price = "Price must be a positive number";
    if (!form.category.trim()) errs.category = "Category is required";
    if (form.image && !/^https?:\/\//.test(form.image) && !form.file) errs.image = "Image must be valid URL or uploaded file";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function addItem(e) {
    e.preventDefault();
    if (!validate()) return;
    const newItem = {
      id: Date.now(),
      title: form.title.trim(),
      price: Number(form.price),
      category: form.category.trim(),
      image: form.image || skincare1,
      liked: false,
    };
    setItems((prev) => [newItem, ...prev]);
    closeAdd();
  }

  function toggleLike(id) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, liked: !item.liked } : item)));
  }

  const categories = ["All", "Skin Care", "Makeup"];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600 text-white dark:bg-blue-500">
              <span className="text-lg">★</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">Wishlist</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Keep track of things you love</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={toggle} className="btn-ghost rounded-xl">{theme === "dark" ? "🌞 Light" : "🌙 Dark"}</button>
            <button onClick={openAdd} className="btn-primary">Add Item</button>
            <button onClick={clearAll} className="btn-ghost">Clear All</button>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input">
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </header>

        <section className="mb-4 flex flex-wrap items-center gap-3">
          <span className="rounded-xl bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
            Items: {filteredItems.length}
          </span>
          <span className="rounded-xl bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
            Total: ${total.toFixed(2)}
          </span>
        </section>

        {filteredItems.length === 0 ? <EmptyState onAdd={openAdd} /> : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((it) => (
              <li key={it.id} className="card">
                <article className="flex flex-col h-full">
                  <div className="aspect-[16/10] overflow-hidden rounded-xl relative">
                    <img src={it.image} alt={it.title} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"/>
                    <button onClick={() => toggleLike(it.id)}
                      className={`absolute top-2 right-2 text-xl ${it.liked ? 'text-red-500' : 'text-white'}`}
                      title={it.liked ? "Unlike" : "Like"}
                    >{it.liked ? "❤️" : "🤍"}</button>
                  </div>
                  <div className="mt-3 flex-1">
                    <h3 className="line-clamp-2 text-lg font-semibold">{it.title}</h3>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{it.category}</span>
                      <span className="text-base font-bold">${it.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button onClick={() => removeItem(it.id)} className="btn-ghost w-full">Remove</button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}

        {isAddOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
            <div className="card w-full max-w-lg p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Add to Wishlist</h2>
                <button onClick={closeAdd} className="btn-ghost">✕</button>
              </div>
              <form onSubmit={addItem} className="space-y-3">
                <div>
                  <label className="label" htmlFor="title">Title</label>
                  <input id="title" name="title" className="input" value={form.title} onChange={handleChange}/>
                  {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="price">Price</label>
                    <input id="price" name="price" type="number" step="0.01" className="input" value={form.price} onChange={handleChange}/>
                    {errors.price && <p className="text-sm text-red-600">{errors.price}</p>}
                  </div>
                  <div>
                    <label className="label" htmlFor="category">Category</label>
                    <select name="category" value={form.category} onChange={handleChange} className="input">
                      <option value="">Select Category</option>
                      <option value="Skin Care">Skin Care</option>
                      <option value="Makeup">Makeup</option>
                    </select>
                    {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="label">Image (URL or Upload)</label>
                  <input type="text" name="image" placeholder="https://..." className="input" value={form.image} onChange={handleChange}/>
                  <input type="file" name="file" accept="image/*" className="input" onChange={handleChange}/>
                  {errors.image && <p className="text-sm text-red-600">{errors.image}</p>}
                </div>
                <button type="submit" className="btn-primary w-full">Add Item</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
      <div className="mx-auto max-w-sm">
        <p className="text-4xl">📝</p>
        <h3 className="mt-3 text-lg font-semibold">No items yet</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Start building your wishlist by adding your first item.</p>
        <button onClick={onAdd} className="btn-primary mt-4">Add Item</button>
      </div>
    </div>
  );
}
