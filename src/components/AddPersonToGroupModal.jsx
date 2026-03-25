import React, { useEffect, useState } from "react";

export function AddPersonToGroupModal({ person, availableGroups, onClose, onAdd }) {
  return (
    <Modal title={`Add ${person?.name || "Person"} to Group`} onClose={onClose}>
      <div className="space-y-2">
        {availableGroups.map((group) => (
          <button
            key={group.id}
            onClick={() => onAdd(group.id)}
            className="w-full text-left rounded-2xl border p-3 hover:bg-stone-50"
          >
            <div className="font-medium">{group.name}</div>
          </button>
        ))}

        {!availableGroups.length && (
          <div className="text-sm text-gray-500">Already in every group.</div>
        )}
      </div>
    </Modal>
  );
} // end of AddPersonToGroupModal()
