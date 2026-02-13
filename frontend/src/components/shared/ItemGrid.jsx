import ItemIcon from './ItemIcon.jsx';

export default function ItemGrid({ items = [], size = 'sm', className }) {
  return (
    <div className={`flex gap-0.5 ${className || ''}`}>
      {[0, 1, 2, 3, 4, 5].map((idx) => (
        <ItemIcon key={idx} itemId={items[idx] || 0} size={size} />
      ))}
      <ItemIcon itemId={items[6] || 0} size={size} isTrinket />
    </div>
  );
}
