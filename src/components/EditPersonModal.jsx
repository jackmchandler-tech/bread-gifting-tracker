import React, { useEffect, useRef, useState }  from "react";
import Modal                                   from "./ui/Modal";
import AppButton                               from "./ui/AppButton";

export default function EditPersonModal({ person, onClose, onSave }) {
  const [form, setForm] = useState({
    name: person?.name || "",
    associatedName: person?.associatedName || "",
    howMet: person?.howMet || "",
    note: person?.note || "",
    phone: person?.phone || "",
  });

  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    setForm({
      name: person?.name || "",
      associatedName: person?.associatedName || "",
      howMet: person?.howMet || "",
      note: person?.note || "",
      phone: person?.phone || "",
    });
  }, [person]);

  return (
    <Modal title="Edit Person" onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.name.trim()) return;

          onSave({
            name: form.name.trim(),
            associatedName: form.associatedName.trim(),
            howMet: form.howMet.trim(),
            note: form.note.trim(),
            phone: form.phone.trim(),
          });
        }}
      >
        {[
          ["name", "Name *"],
          ["associatedName", "Associated person"],
          ["howMet", "How you met them"],
          ["note", "Position / note"],
          ["phone", "Phone number"],
        ].map(([key, label], index) => (
          <input
            key={key}
            ref={index === 0 ? nameRef : undefined}
            value={form[key]}
            onChange={(e) =>
              setForm((f) => ({ ...f, [key]: e.target.value }))
            }
            placeholder={label}
            className="w-full rounded-2xl border px-3 py-3 outline-none"
          />
        ))}

        <div className="flex justify-end gap-2 pt-2">
          <AppButton onClick={onClose} variant="secondary">
            Cancel
          </AppButton>
          <AppButton type="submit" disabled={!form.name.trim()}>
            Save Changes
          </AppButton>
        </div>
      </form>
    </Modal>
  );
} // end of EditPersonModal()
