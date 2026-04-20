import React from 'react';

export default function ContextMenu({ contextMenu, onAction }) {
  if (!contextMenu) return null;

  return (
    <div
      className="design-context-menu"
      style={{ left: contextMenu.x, top: contextMenu.y }}
      onClick={(event) => event.stopPropagation()}
    >
      <button type="button" onClick={() => onAction('select')}>Chon lop</button>
      <button type="button" onClick={() => onAction('duplicate')}>Nhan doi</button>
      <button type="button" onClick={() => onAction('align-center')}>Can giua ngang</button>
      <button type="button" onClick={() => onAction('align-middle')}>Can giua doc</button>
      <button type="button" onClick={() => onAction('align-selection-left')}>Canh trai nhom</button>
      <button type="button" onClick={() => onAction('align-selection-center')}>Canh giua nhom</button>
      <button type="button" onClick={() => onAction('distribute-x')}>Gian deu ngang</button>
      <button type="button" className="danger" onClick={() => onAction('delete')}>Xoa</button>
    </div>
  );
}
