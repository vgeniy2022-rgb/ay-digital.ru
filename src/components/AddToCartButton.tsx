import { Check, ShoppingCart } from 'lucide-react';
import { MouseEvent, useState } from 'react';
import { useCart } from '../hooks/useCart';
import { CartItem } from '../types/cart';

type AddToCartButtonProps = {
  item: CartItem;
  className?: string;
};

export function AddToCartButton({ item, className = '' }: AddToCartButtonProps) {
  const { addItem, items } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const quantity = items.find((cartItem) => cartItem.key === item.key)?.quantity ?? 0;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    addItem(item);
    setIsAdded(true);
    window.setTimeout(() => setIsAdded(false), 1300);
  };

  return (
    <button
      className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-white text-ink shadow-glass transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 active:scale-95 ${className}`}
      type="button"
      aria-label="Добавить в список"
      title="Добавить в список"
      onClick={handleClick}
    >
      {isAdded ? <Check className="h-5 w-5 text-emerald-600" /> : <ShoppingCart className="h-5 w-5" />}
      {quantity > 0 ? (
        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-extrabold text-white">
          {quantity}
        </span>
      ) : null}
    </button>
  );
}
