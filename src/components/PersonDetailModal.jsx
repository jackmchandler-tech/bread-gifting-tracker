import React, { useEffect, useState } from "react";
import SectionCard                    from "./ui/SectionCard";
import AppButton                      from "./ui/AppButton";
import Modal                          from "./ui/Modal";
import StarPicker                     from "./ui/StarPicker";
import { Phone }                      from "./ui/Icons";

export default function PersonDetailModal({
  person,
  gifts,
  lists,
  memberships,
  enableFeedback,
  enableRatings,
  onClose,
  onEditPerson,
  onEditGiftFeedback,
  onSaveFeedback,
  onRemoveFromGroup,
  onOpenAddToGroup,
  onDeactivate,
}) {
  const latest = gifts[0] || null;
  const [feedback, setFeedback] = useState(latest?.feedback || "");
  const [rating, setRating] = useState(latest?.rating || 0);
  const [editingFeedback, setEditingFeedback] = useState(false);

  useEffect(() => {
    setFeedback(latest?.feedback || "");
    setRating(latest?.rating || 0);
    setEditingFeedback(false);
  }, [latest?.id]);

  const sourceName = (gift) =>
    lists.find((l) => l.id === gift.listId)?.name || "All People";

  const membershipsForPerson = memberships.filter((m) => m.personId === person.id);
  const hasSavedFeedback = latest && (latest.feedback || latest.rating);

  return (
    <Modal title={person.name} onClose={onClose}>
      <div className="space-y-4">
        <SectionCard
          title="Details"
          action={
            <AppButton onClick={onEditPerson} variant="secondary">
              Edit Person
            </AppButton>
          }
        >
          {!!person.associatedName && (
            <div className="text-sm">
              <span className="font-medium">Associated:</span> {person.associatedName}
            </div>
          )}

          {!!person.howMet && (
            <div className="text-sm">
              <span className="font-medium">How met:</span> {person.howMet}
            </div>
          )}

          {!!person.note && (
            <div className="text-sm">
              <span className="font-medium">Note:</span> {person.note}
            </div>
          )}

          {!!person.phone && (
            <div className="text-sm flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {person.phone}
            </div>
          )}

          <div className="pt-2">
            <AppButton
              variant="danger"
              onClick={() => {
                if (confirm("Deactivate this person? They will be hidden but not deleted.")) {
                  onDeactivate(person.id);
                  onClose();
                }
              }}
            >
              Deactivate Person
            </AppButton>
          </div>
        </SectionCard>

        <SectionCard
          title={`Group Memberships (${membershipsForPerson.length})`}
          action={
            <AppButton onClick={onOpenAddToGroup} variant="secondary">
              Add to Group
            </AppButton>
          }
        >
          <div className="space-y-2">
            {membershipsForPerson.map((membership) => {
              const group = lists.find((l) => l.id === membership.listId);
              if (!group) return null;

              return (
                <div
                  key={membership.id}
                  className="rounded-2xl border p-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-medium">{group.name}</div>
                    {membership.isNewToList && (
                      <div className="text-xs text-gray-500">New to group</div>
                    )}
                  </div>
                  <AppButton
                    variant="danger"
                    onClick={() => onRemoveFromGroup(group.id)}
                  >
                    Remove
                  </AppButton>
                </div>
              );
            })}

            {!membershipsForPerson.length && (
              <div className="text-sm text-gray-500">Not in any groups yet.</div>
            )}
          </div>
        </SectionCard>

        {latest && (
          <SectionCard title="Latest Gift">
            <div className="text-sm">
              {latest.date} · {latest.breadTypeName} · {sourceName(latest)}
            </div>

            {hasSavedFeedback && !editingFeedback && (
              <div className="space-y-2">
                {!!latest.rating && enableRatings && (
                  <div className="text-sm text-amber-700">
                    {"★".repeat(latest.rating)}
                    {"☆".repeat(5 - latest.rating)}
                  </div>
                )}

                {!!latest.feedback && enableFeedback && (
                  <div className="text-sm">{latest.feedback}</div>
                )}

                {(enableFeedback || enableRatings) && (
                  <AppButton
                    variant="secondary"
                    onClick={() => setEditingFeedback(true)}
                  >
                    Edit Feedback
                  </AppButton>
                )}
              </div>
            )}

            {(!hasSavedFeedback || editingFeedback) && (enableFeedback || enableRatings) && (
              <div className="space-y-3">
                {enableFeedback && (
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Feedback for this gift"
                    className="w-full rounded-2xl border px-3 py-3 min-h-[100px] outline-none"
                  />
                )}

                {enableRatings && (
                  <StarPicker value={rating} onChange={setRating} />
                )}

                <div className="flex gap-2">
                  {editingFeedback && (
                    <AppButton
                      variant="secondary"
                      onClick={() => setEditingFeedback(false)}
                    >
                      Cancel
                    </AppButton>
                  )}
                  <AppButton
                    onClick={() => {
                      onSaveFeedback(feedback, rating);
                      setEditingFeedback(false);
                    }}
                  >
                    Save Feedback
                  </AppButton>
                </div>
              </div>
            )}
          </SectionCard>
        )}

        <SectionCard title="Gift History">
          <div className="space-y-3">
            {gifts.map((gift) => (
              <div key={gift.id} className="rounded-2xl border p-3 space-y-2">
                <div className="font-medium">
                  {gift.date} · {gift.breadTypeName}
                </div>
                <div className="text-sm text-gray-500">{sourceName(gift)}</div>

                {!!gift.rating && enableRatings && (
                  <div className="text-sm mt-2 text-amber-700">
                    {"★".repeat(gift.rating)}
                    {"☆".repeat(5 - gift.rating)}
                  </div>
                )}

                {!!gift.feedback && enableFeedback && (
                  <div className="text-sm mt-2">{gift.feedback}</div>
                )}

                {(enableFeedback || enableRatings) && (
                  <div>
                    <AppButton
                      variant="secondary"
                      onClick={() => onEditGiftFeedback(gift.id)}
                    >
                      Edit Feedback
                    </AppButton>
                  </div>
                )}
              </div>
            ))}

            {!gifts.length && (
              <div className="text-sm text-gray-500">No gift history yet.</div>
            )}
          </div>
        </SectionCard>
      </div>
    </Modal>
  );
} // end of PersonDetailModal()
