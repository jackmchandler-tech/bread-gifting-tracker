import

function AddPersonModal({ list, onClose, onSave }) {
  const [form, setForm] = useState({ name: "", associatedName: "", howMet: "", note: "", phone: "" });
  const [membershipModalPersonId, setMembershipModalPersonId] = useState(null); // controls Add-to-Group modal from person details 1.3.0
  const nameRef = useRef(null);
  useEffect(() => { nameRef.current?.focus(); }, []);
  return (
    <Modal title="Add Person" onClose={onClose}>
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
        {[
          ["name", "Name *"], ["associatedName", "Associated person"], ["howMet", "How you met them"], ["note", "Position / note"], ["phone", "Phone number"],
        ].map(([key, label], index) => (
          <input key={key} ref={index === 0 ? nameRef : undefined} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} placeholder={label} className="w-full rounded-2xl border px-3 py-3 outline-none" />
        ))}
        <div className="text-sm text-gray-500 rounded-2xl bg-stone-50 border p-3">
          {list ? `Saving will add this person to the master list and to ${list.name}.` : "Saving will add this person to the master list only."}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <AppButton onClick={onClose} variant="secondary">Cancel</AppButton>
          <AppButton type="submit" disabled={!form.name.trim()}>Save</AppButton>
        </div>
      </form>
    </Modal>
  );
} // end of AddPersonModal()
