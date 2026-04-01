import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Plus, Minus, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

const DARK  = '#1C1C1C';
const GOLD  = '#C9A870';
const BEIGE = '#F5F2EC';
const BORDER = '#2A2A2A';

function formatPrice(n: number) {
  return `₪${n.toLocaleString('he-IL')}`;
}

export default function CartDrawer() {
  const { items, updateQuantity, clearCart, totalCount, isOpen, closeCart } = useCart();
  const total = items.reduce((sum, i) => sum + i.model.price * i.quantity, 0);
  const [ordering, setOrdering] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [step, setStep] = useState<'cart' | 'details'>('cart');
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

  const validateAndCheckout = () => {
    const errors: Record<string, boolean> = {};
    if (!form.name.trim()) errors.name = true;
    if (!form.phone.trim()) errors.phone = true;
    if (!form.address.trim()) errors.address = true;
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    handleCheckout();
  };

  const handleCheckout = async () => {
    setOrdering(true);
    try {
      for (const item of items) {
        await supabase.from('orders').insert({
          product_name: item.model.name,
          customer_name: form.name,
          customer_email: form.email || null,
          customer_phone: form.phone,
          notes: form.address,
          quantity: item.quantity,
          unit_price: item.model.price,
          total_price: item.model.price * item.quantity,
          status: 'pending',
        });

        // Reduce stock
        const { data: product } = await supabase
          .from('products')
          .select('id, stock')
          .eq('name', item.model.name)
          .single();

        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          await supabase.from('products').update({ stock: newStock }).eq('id', product.id);
          await supabase.from('inventory_log').insert({
            product_id: product.id,
            product_name: item.model.name,
            change_amount: -item.quantity,
            reason: 'sale',
            note: 'הזמנה מהאתר',
          });
        }
      }
      clearCart();
      setOrdered(true);
      setStep('cart');
      setForm({ name: '', email: '', phone: '', address: '' });
      setTimeout(() => { setOrdered(false); closeCart(); }, 2500);
    } catch {
      // silent
    }
    setOrdering(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            style={{
              position: 'fixed', inset: 0, zIndex: 998,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: '100%', maxWidth: '420px',
              zIndex: 999,
              backgroundColor: DARK,
              display: 'flex', flexDirection: 'column',
              borderLeft: `1px solid ${BORDER}`,
            }}
            dir="rtl"
          >
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <img src="/assets/logo.png" alt="SPINZ" style={{ height: '36px', width: 'auto', objectFit: 'contain', filter: 'invert(1) brightness(2)', opacity: 0.9 }} />
                <button onClick={closeCart} style={{ color: BEIGE, background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                  <X size={22} />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingCart size={18} style={{ color: GOLD }} />
                <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: '18px', color: BEIGE, margin: 0 }}>
                  עגלת קניות
                </h2>
                {totalCount > 0 && (
                  <span style={{
                    backgroundColor: GOLD, color: DARK,
                    fontFamily: "'Heebo', sans-serif", fontSize: '11px', fontWeight: 700,
                    borderRadius: '50%', width: '22px', height: '22px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {totalCount}
                  </span>
                )}
              </div>
            </div>

            {/* Items */}
            <div
              style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}
              onWheel={e => e.stopPropagation()}
              onTouchMove={e => e.stopPropagation()}
            >
              {items.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', opacity: 0.5 }}>
                  <ShoppingCart size={48} style={{ color: BEIGE }} />
                  <p style={{ fontFamily: "'Heebo', sans-serif", color: BEIGE, fontSize: '15px', margin: 0 }}>
                    העגלה ריקה
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <AnimatePresence>
                    {items.map(item => (
                      <motion.div
                        key={item.model.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          border: `1px solid ${BORDER}`,
                          borderRadius: '8px',
                          padding: '16px',
                          display: 'flex',
                          gap: '16px',
                          alignItems: 'center',
                        }}
                      >
                        <img
                          src={item.model.image.replace('.png', '.jpg')}
                          alt={item.model.name}
                          onError={e => { (e.currentTarget as HTMLImageElement).src = item.model.image; }}
                          style={{ width: '80px', height: '60px', objectFit: 'contain', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: '16px', color: BEIGE, margin: '0 0 4px' }}>
                            {item.model.name}
                          </h3>
                          <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '16px', fontWeight: 700, color: GOLD }}>
                            {formatPrice(item.model.price * item.quantity)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          <button
                            onClick={() => updateQuantity(item.model.id, item.quantity + 1)}
                            style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '4px', color: BEIGE, cursor: 'pointer' }}
                          >
                            <Plus size={14} />
                          </button>
                          <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', fontWeight: 700, color: BEIGE, minWidth: '20px', textAlign: 'center' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.model.id, item.quantity - 1)}
                            style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '4px', color: item.quantity === 1 ? '#CC4400' : BEIGE, cursor: 'pointer' }}
                          >
                            <Minus size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Order success */}
            <AnimatePresence>
              {ordered && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ position: 'absolute', inset: 0, backgroundColor: DARK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', zIndex: 10 }}
                >
                  <CheckCircle size={48} style={{ color: GOLD }} />
                  <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: '22px', color: '#EDEBE6', margin: 0 }}>ההזמנה התקבלה!</h3>
                  <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', color: '#888', margin: 0 }}>נחזור אליך בקרוב</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Details step */}
            <AnimatePresence>
              {step === 'details' && (
                <motion.div
                  initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  style={{ position: 'absolute', inset: 0, backgroundColor: DARK, display: 'flex', flexDirection: 'column', zIndex: 5 }}
                  dir="rtl"
                >
                  {/* Header */}
                  <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => setStep('cart')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '4px', fontSize: '20px', lineHeight: 1 }}>←</button>
                    <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '17px', color: BEIGE, margin: 0 }}>פרטי משלוח</h3>
                  </div>

                  {/* Form */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }} onWheel={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
                    {[
                      { key: 'name', label: 'שם מלא *', placeholder: 'ישראל ישראלי', type: 'text' },
                      { key: 'phone', label: 'טלפון *', placeholder: '050-0000000', type: 'tel' },
                      { key: 'email', label: 'מייל', placeholder: 'israel@example.com', type: 'email' },
                      { key: 'address', label: 'כתובת למשלוח *', placeholder: 'רחוב, עיר, מיקוד', type: 'text' },
                    ].map(({ key, label, placeholder, type }) => (
                      <div key={key}>
                        <label style={{ display: 'block', fontFamily: "'Heebo', sans-serif", fontSize: '11px', color: formErrors[key] ? '#FF6B6B' : '#888', letterSpacing: '0.1em', marginBottom: '6px', textTransform: 'uppercase' }}>
                          {label}
                        </label>
                        <input
                          type={type}
                          placeholder={placeholder}
                          value={form[key as keyof typeof form]}
                          onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setFormErrors(f => ({ ...f, [key]: false })); }}
                          style={{
                            width: '100%', padding: '11px 14px',
                            backgroundColor: '#252525',
                            border: `1px solid ${formErrors[key] ? '#FF6B6B' : BORDER}`,
                            borderRadius: '8px', color: BEIGE,
                            fontFamily: "'Heebo', sans-serif", fontSize: '14px',
                            outline: 'none', direction: key === 'email' || key === 'phone' ? 'ltr' : 'rtl',
                            boxSizing: 'border-box',
                          }}
                        />
                        {formErrors[key] && <p style={{ color: '#FF6B6B', fontSize: '11px', margin: '4px 0 0', fontFamily: "'Heebo', sans-serif" }}>שדה חובה</p>}
                      </div>
                    ))}

                    {/* Summary */}
                    <div style={{ backgroundColor: '#252525', border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '14px 16px', marginTop: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: '#888' }}>סה"כ להזמנה</span>
                        <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', fontWeight: 700, color: GOLD }}>{formatPrice(total)}</span>
                      </div>
                      <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '11px', color: '#555', margin: 0 }}>כולל מע"מ ומשלוח</p>
                    </div>
                  </div>

                  {/* Submit */}
                  <div style={{ padding: '20px 24px', borderTop: `1px solid ${BORDER}` }}>
                    <button onClick={validateAndCheckout} disabled={ordering}
                      style={{ width: '100%', backgroundColor: GOLD, color: DARK, border: 'none', borderRadius: '4px', padding: '15px', fontFamily: "'Heebo', sans-serif", fontSize: '14px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: ordering ? 'not-allowed' : 'pointer', opacity: ordering ? 0.7 : 1 }}>
                      {ordering ? '...' : 'אשר הזמנה'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            {items.length > 0 && (
              <div style={{ padding: '24px', borderTop: `1px solid ${BORDER}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', color: '#888' }}>סה"כ</span>
                  <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '22px', fontWeight: 800, color: GOLD }}>
                    {formatPrice(total)}
                  </span>
                </div>
                <button
                  onClick={() => setStep('details')}
                  disabled={ordering}
                  style={{
                    width: '100%',
                    backgroundColor: GOLD, color: DARK,
                    border: 'none', borderRadius: '4px',
                    padding: '16px',
                    fontFamily: "'Heebo', sans-serif",
                    fontSize: '14px', fontWeight: 700,
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    cursor: ordering ? 'not-allowed' : 'pointer',
                    opacity: ordering ? 0.7 : 1,
                    transition: 'background-color 0.25s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#B8933A'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = GOLD; }}
                >
                  {ordering ? '...' : 'המשך לתשלום'}
                </button>
                <button
                  onClick={clearCart}
                  style={{
                    width: '100%', marginTop: '10px',
                    backgroundColor: 'transparent', color: '#666',
                    border: 'none',
                    fontFamily: "'Heebo', sans-serif",
                    fontSize: '12px', cursor: 'pointer',
                    letterSpacing: '0.1em',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = BEIGE; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#666'; }}
                >
                  רוקן עגלה
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
