import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const DARK  = '#1C1C1C';
const GOLD  = '#C9A870';
const BEIGE = '#F5F2EC';
const BORDER = '#2A2A2A';

function formatPrice(n: number) {
  return `₪${n.toLocaleString('he-IL')}`;
}

export default function CartDrawer() {
  const { items, removeItem, clearCart, totalCount, isOpen, closeCart } = useCart();
  const total = items.reduce((sum, i) => sum + i.model.price * i.quantity, 0);

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
            <div style={{ padding: '24px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingCart size={20} style={{ color: GOLD }} />
                <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: '20px', color: BEIGE, margin: 0 }}>
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
              <button onClick={closeCart} style={{ color: BEIGE, background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <X size={22} />
              </button>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '16px', fontWeight: 700, color: GOLD }}>
                              {formatPrice(item.model.price * item.quantity)}
                            </span>
                            {item.quantity > 1 && (
                              <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '11px', color: '#888', backgroundColor: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '20px' }}>
                                x{item.quantity}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.model.id)}
                          style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#CC4400'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#666'; }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

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
                  onClick={() => {
                    closeCart();
                    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{
                    width: '100%',
                    backgroundColor: GOLD, color: DARK,
                    border: 'none', borderRadius: '4px',
                    padding: '16px',
                    fontFamily: "'Heebo', sans-serif",
                    fontSize: '14px', fontWeight: 700,
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'background-color 0.25s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#B8933A'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = GOLD; }}
                >
                  המשך לתשלום
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
